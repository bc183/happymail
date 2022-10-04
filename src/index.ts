import chalk from "chalk";
import dotenv from "dotenv";
import http from "http";
import oauthActions from "./actions/oauth-actions";
import oauthEnquiries from "./enquiries/oauth-enquiries";
import { Environment } from "./types";
import { checkEnvironment, exitApp, getEnv } from "./utils";

dotenv.config();

const server = http.createServer(oauthActions.handleOAuthRedirect);

const initApp = async () => {
    try {
        checkEnvironment();
        console.log(chalk.blue("Welcome to", chalk.italic.red("Happy Mail")));

        // init server for oauth redirect.
        server.listen(getEnv(Environment.PORT));

        // login using gmail OAuth.
        await oauthEnquiries.login();
    } catch (error) {
        console.error(error);
        console.log(chalk.red("Someting went wrong"));
        exitApp();
    }
};

initApp();