import axios from "axios";
import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import open from "open";
import querystring from "querystring";
import emailEnquiries from "../enquiries/email-enquiries";
import { chalkAlert, chalkInfo } from "../logger";
import userService from "../service/user-service";
import userStore from "../store/user-store";
import { Environment, IGoogleUser, Routes } from "../types";
import { exitApp, getEnv, getQueryParams } from "../utils";

class OAuthAction {
    constructor() {
        this.login = this.login.bind(this);
        this.handleOAuthRedirect = this.handleOAuthRedirect.bind(this);
    }

    /**
     * @description Logs in the user
     */
    async login(email?: string) {
        // const user = await userService.getUserByEmail(email);

        // if (user) {
        //     userStore.user = user;
        //     userStore.accessToken = user.accessToken;
        //     userStore.refreshToken = user.refreshToken;

        //     console.log(chalk.blue("Login successful."));

        //     // ask email filter regarding questions.
        //     await emailEnquiries.getEmails();
        //     return;
        // }
        // generate google oauth url
        const googleUrl = this._generateLoginUrl();

        // get consent from user.
        await open(googleUrl);
    }

    /**
     * @description handle OAuth redirect
     * @param request
     * @param response
     */
    async handleOAuthRedirect(request: IncomingMessage, response: ServerResponse) {
        // handle redirect from google.
        if (request.url?.startsWith(Routes.OAUTH_REDIRECT_URI)) {
            const { code } = getQueryParams(request.url);

            if (!code) {
                throw new Error("No code present in redirect_uri");
            }

            // get accessToken and refreshToken from google.
            const { id_token, access_token, refresh_token } = await this.getTokens({
                code: code as string,
                clientId: getEnv(Environment.GOOGLE_CLIENT_ID),
                clientSecret: getEnv(Environment.GOOGLE_CLIENT_SECRET),
                redirectUri: `${getEnv(Environment.SERVER_URI)}${Routes.OAUTH_REDIRECT_URI}`,
            });

            // decode user data from id_token
            const user = this._decodeUserFromToken(id_token);

            // store user in local store.
            userStore.user = {
                email: user.email,
                username: user.name,
                accessToken: access_token,
                refreshToken: refresh_token,
            };

            userStore.accessToken = access_token;
            userStore.refreshToken = refresh_token;

            // store user in db.
            await userService.saveUser(user);

            // return response
            response.writeHead(200);
            response.end(
                "<h1 style='text-align:center;margin-top:40px;'>Authentication successful. Kindly go back to terminal<h1>"
            );
            chalkInfo("Login successful.");

            // ask email filter regarding questions.
            await emailEnquiries.getEmails();
        }
    }

    /**
     * @description Decodes user data from id_token
     * @param token
     * @returns IGoogleUser
     */
    private _decodeUserFromToken(token: string) {
        const decodedData = jwt.decode(token) as IGoogleUser;

        if (!decodedData) {
            throw new Error("Given token is not valid");
        }

        return decodedData;
    }

    /**
     *
     * @description Gets the access_token and refresh_token from google
     * @returns
     */
    async getTokens({
        code,
        clientId,
        clientSecret,
        redirectUri,
        refreshToken,
        grantType = "authorization_code",
    }: {
        code?: string;
        clientId: string;
        clientSecret: string;
        refreshToken?: string;
        redirectUri?: string;
        grantType?: string;
    }): Promise<{
        access_token: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
        id_token: string;
    }> {
        try {
            const url = "https://oauth2.googleapis.com/token";
            const values = {
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: grantType,
                refresh_token: refreshToken,
            };

            const response = await axios.post(url, querystring.stringify(values), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            return response.data;
        } catch (error: any) {
            if (error.response.data.error === "invalid_grant") {
                chalkAlert("Your session has expired.");
                exitApp();
            }
            throw error;
        }
    }

    /**
     * @description Generated Google Login Url.
     * @returns Google login url
     */
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
