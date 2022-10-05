import chalk from "chalk";
import { Environment } from "./types";
import url from "url";
import fs from "fs";
import utils from "util";

const write = utils.promisify(fs.writeFile);

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

export const getMailModifyUrl = (email: string): string => {
    return `${GMAIL_BASE_URL}/${email}/messages/batchModify`;
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

/**
 * @description convert base64 to string
 * @param base64
 * @returns string
 */
export const base64ToString = (base64: string) => {
    const buff = Buffer.from(base64, "base64");
    return buff.toString("ascii");
};

/**
 * @description An unitily to compare dates.
 * @param d1
 * @param d2
 * @returns 0 if dates are equal, 1 if d1 > d2, -1 if d1 < d2
 */
export const compareDate = (d1: Date, d2: Date) => {
    if (d1 < d2) {
        return -1;
    } else if (d1 > d2) {
        return 1;
    } else {
        return 0;
    }
};

/**
 * @description Return the date by reducing the number of days given,
 * @param date
 * @param noOfDays
 * @returns Date
 */
export const subractDays = (date: Date, noOfDays: number) => {
    return new Date(date.setDate(date.getDate() - noOfDays));
};

export const deleteFieldsFromArray = <T>(array: T[], fieldsToRemoved: T[]): T[] => {
    const result: T[] = [];

    for (const field of array) {
        if (!fieldsToRemoved.includes(field)) {
            result.push(field);
        }
    }

    return result;
};

export const writeToFile = async (path: string, data: string) => {
    await write(path, data);
};
