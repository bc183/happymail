import chalk from "chalk";
import dotenv from "dotenv";
import http from "http";
import oauthActions from "./actions/oauth-actions";
import db from "./database";
import oauthEnquiries from "./enquiries/oauth-enquiries";
import { Environment } from "./types";
import { checkEnvironment, exitApp, getEnv } from "./utils";

dotenv.config();

const server = http.createServer(oauthActions.handleOAuthRedirect);

const initApp = async () => {
    try {
        // check if all environment variables are set
        checkEnvironment();

        //connect to db
        await db.$connect();

        console.log(chalk.blue("Welcome to", chalk.italic.red("Happy Mail")));

        // init server for oauth redirect.
        server.listen(getEnv(Environment.PORT));

        // login using gmail OAuth.
        await oauthEnquiries.login();
    } catch (error: any) {
        console.log(chalk.red(error.message));
        exitApp();
    }
};

process.on("uncaughtException", (error) => {
    console.log(chalk.red(error.message));
    exitApp();
});

initApp();
