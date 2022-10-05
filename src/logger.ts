import chalk from "chalk";

export const chalkInfo = (message: string) => {
    console.log(chalk.italic(message));
};

export const chalkAlert = (message: string) => {
    console.log(chalk.red(message));
};
