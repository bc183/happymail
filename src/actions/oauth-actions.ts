import axios from "axios";
import chalk from "chalk";
import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import open from "open";
import querystring from "querystring";
import emailEnquiries from "../enquiries/email-enquiries";
import userService from "../service/user-service";
import userStore from "../store/user-store";
import { Environment, IGoogleUser, Routes } from "../types";
import { getEnv, getQueryParams } from "../utils";

class OAuthAction {
    constructor() {
        this.login = this.login.bind(this);
        this.handleOAuthRedirect = this.handleOAuthRedirect.bind(this);
    }

    async login() {
        // generate google oauth url
        const googleUrl = this._generateLoginUrl();

        // get consent from user.
        await open(googleUrl);
    }

    async handleOAuthRedirect(request: IncomingMessage, response: ServerResponse) {
        // handle redirect from google.
        if (request.url?.startsWith(Routes.OAUTH_REDIRECT_URI)) {
            const { code } = getQueryParams(request.url);

            if (!code) {
                throw new Error("No code present in redirect_uri");
            }

            // get accessToken and refreshToken from google.
            const { id_token, access_token, refresh_token } = await this._getTokens({
                code: code as string,
                clientId: getEnv(Environment.GOOGLE_CLIENT_ID),
                clientSecret: getEnv(Environment.GOOGLE_CLIENT_SECRET),
                redirectUri: `${getEnv(Environment.SERVER_URI)}${Routes.OAUTH_REDIRECT_URI}`,
            });

            const user = this._decodeUserFromToken(id_token);

            userStore.user = {
                email: user.email,
                username: user.name,
                accessToken: access_token,
                refreshToken: refresh_token,
            };

            userStore.accessToken = access_token;
            userStore.refreshToken = refresh_token;

            await userService.saveUser(user);

            response.writeHead(200);
            response.end(
                "<h1 style='text-align:center;margin-top:40px;'>Authentication successful. Kindly go back to terminal<h1>"
            );
            console.log(chalk.blue("Login successful."));

            emailEnquiries.getEmails();
        }
    }

    private _decodeUserFromToken(token: string) {
        const decodedData = jwt.decode(token) as IGoogleUser;

        if (!decodedData) {
            throw new Error("Given token is not valid");
        }

        return decodedData;
    }

    private async _getTokens({
        code,
        clientId,
        clientSecret,
        redirectUri,
    }: {
        code: string;
        clientId: string;
        clientSecret: string;
        redirectUri: string;
    }): Promise<{
        access_token: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
        id_token: string;
    }> {
        /*
         * Uses the code to get tokens
         * that can be used to fetch the user's profile
         */
        const url = "https://oauth2.googleapis.com/token";
        const values = {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        };

        return axios
            .post(url, querystring.stringify(values), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((res) => res.data)
            .catch((_) => {
                throw new Error("Failed to fetch auth tokens");
            });
    }

    private _generateLoginUrl(): string {
        const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

        const googleClientId = getEnv(Environment.GOOGLE_CLIENT_ID);

        const options = {
            redirect_uri: `${getEnv(Environment.SERVER_URI)}${Routes.OAUTH_REDIRECT_URI}`,
            client_id: googleClientId,
            access_type: "offline",
            response_type: "code",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://mail.google.com",
            ].join(" "),
        };
        return `${rootUrl}?${querystring.stringify(options)}`;
    }
}

export default new OAuthAction();
