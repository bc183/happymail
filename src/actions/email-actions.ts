import axios from "axios";
import chalk from "chalk";
import emailService from "../service/email-service";
import userStore from "../store/user-store";
import { GmailHeaders, IGMail, IGMailList, IMail } from "../types";
import { getMailListUrl, getMailUrl } from "../utils";

class EmailActions {
    constructor() {
        this.fetchEmailList = this.fetchEmailList.bind(this);
    }

    async fetchEmailList(count: number) {
        try {
            const user = userStore.user;
            const mails: IMail[] = [];
            if (user) {
                console.log(chalk.italic("Fetching emails..."));
                const mailList = await axios.get<IGMailList>(getMailListUrl(user.email), {
                    headers: {
                        Authorization: `Bearer ${userStore.accessToken}`,
                    },
                    params: {
                        maxResults: count,
                    },
                });

                const messages = mailList.data?.messages;

                for (const message of messages) {
                    const fetchedMail = await axios.get<IGMail>(
                        getMailUrl(user.email, message.id),
                        {
                            headers: {
                                Authorization: `Bearer ${userStore.accessToken}`,
                            },
                        }
                    );

                    const processGMailData = this._processGMailData(fetchedMail.data);

                    // save mail to db
                    emailService.saveEmail(processGMailData);
                    mails.push(processGMailData);
                }
                console.log(chalk.italic("Email fetched..."));
                return mails;
            }
        } catch (error) {
            console.log(error);
        }
    }

    private _processGMailData(data: IGMail): IMail {
        try {
            const neededHeaders: Record<string, string> = {};
            for (const header of data.payload.headers) {
                if (Object.values(GmailHeaders).includes(header.name as GmailHeaders)) {
                    neededHeaders[header.name] = header.value;
                }
            }
            let body = null;
            if (data.payload.parts) {
                const b64Data = data.payload.parts[0].body?.data;
                if (b64Data) {
                    body = b64Data;
                }
            } else {
                const b64Data = data.payload.body?.data;
                if (b64Data) {
                    body = b64Data;
                }
            }
            return {
                from: neededHeaders[GmailHeaders.FROM],
                to: neededHeaders[GmailHeaders.TO],
                cc: neededHeaders[GmailHeaders.CC] ?? null,
                bcc: neededHeaders[GmailHeaders.BCC] ?? null,
                body: body,
                recievedAt: new Date(neededHeaders[GmailHeaders.DATE]),
                messageId: data.id,
                subject: neededHeaders[GmailHeaders.SUBJECT] ?? "",
                labels: data.labelIds,
            };
        } catch (error) {
            throw error;
        }
    }
}

export default new EmailActions();
