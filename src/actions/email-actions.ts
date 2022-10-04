import axios from "axios";
import chalk from "chalk";
import userStore from "../store/user-store";
import { getMailListUrl, getMailUrl } from "../utils";

class EmailActions {
    async fetchEmailList(count: number) {
        try {
            const user = userStore.user;
            const mails: any[] = [];
            if (user) {
                console.log(chalk.italic("Fetching emails..."));
                const mailList = await axios.get(getMailListUrl(user.email), {
                    headers: {
                        Authorization: `Bearer ${userStore.accessToken}`,
                    },
                    params: {
                        maxResults: count,
                    },
                });

                const messages: any = mailList.data?.messages;

                for (const message of messages) {
                    const fetchedMail = await axios.get(getMailUrl(user.email, message.id), {
                        headers: {
                            Authorization: `Bearer ${userStore.accessToken}`,
                        },
                    });
                    mails.push(fetchedMail);
                }
                console.log(chalk.italic("Email fetched..."));
                return mails;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export default new EmailActions();
