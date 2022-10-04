import chalk from "chalk";
import { Environment } from "./types";
import url from "url";

export const GMAIL_BASE_URL = "https://gmail.googleapis.com/gmail/v1/users";

export const exitApp = (message?: string) => {
    if (message) {
        console.log(chalk.bold.red(message));
    }
    process.exit(0);
};

export const getMailListUrl = (email: string): string => {
    return `${GMAIL_BASE_URL}/${email}/messages`;
};

export const getMailUrl = (email: string, messageId: string): string => {
    return `${GMAIL_BASE_URL}/${email}/messages/${messageId}`;
};

export const getEnv = (env: Environment | string): string => {
    const value = process.env[env];
    if (!value) {
        throw new Error(`Environment variable ${env} is not defined`);
    }
    return value;
};

export const checkEnvironment = () => {
    for (const key in Environment) {
        getEnv(key);
    }
};

export const getQueryParams = (urlToParse: string) => {
    const queryObject = url.parse(urlToParse, true).query;
    return queryObject;
};

export const base64ToString = (base64: string) => {
    const buff = Buffer.from(base64, "base64");
    return buff.toString("ascii");
};
