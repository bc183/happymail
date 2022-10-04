/* eslint-disable indent */
import axios from "axios";
import chalk from "chalk";
import emailService from "../service/email-service";
import filterService from "../service/filter-service";
import mailStore from "../store/mail-store";
import userStore from "../store/user-store";
import { GmailHeaders, IGMail, IGMailList, IMail, IQuery, Predicate, QueryFields } from "../types";
import { getMailListUrl, getMailUrl, subractDays } from "../utils";

class EmailActions {
    constructor() {
        this.fetchEmailList = this.fetchEmailList.bind(this);
    }

    async fetchEmailList(count: number): Promise<IMail[]> {
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
                    // emailService.saveEmail(processGMailData);
                    mails.push(processGMailData);
                }
                console.log(chalk.italic("Email fetched..."));
            }
            return mails;
        } catch (error) {
            throw error;
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

    filterMail(query: IQuery) {
        try {
            const queries = query.query;
            let dayToBeCompared = new Date();
            if (
                queries[QueryFields.RECIEVED_AT] &&
                typeof queries[QueryFields.RECIEVED_AT].value === "number"
            ) {
                dayToBeCompared = subractDays(
                    dayToBeCompared,
                    queries[QueryFields.RECIEVED_AT].value as number
                );
            }
            const filterFunction = (mail: IMail) => {
                for (const key of Object.keys(queries)) {
                    const predicate = queries[key as QueryFields].predicate;
                    const value = mail[key as keyof typeof mail];
                    const valueToBeCompared = queries[key as QueryFields].value;
                    const toBeTaken = this._performFilter(
                        value,
                        valueToBeCompared,
                        predicate,
                        dayToBeCompared
                    );

                    if (toBeTaken && !query.matchAll) {
                        return true;
                    } else if (!toBeTaken && query.matchAll) {
                        return false;
                    }
                }

                return query.matchAll;
            };
            const filteredMails = mailStore.mails.filter(filterFunction);

            return filteredMails;
        } catch (error) {
            throw error;
        }
    }

    private _performFilter(
        value: string | Date | string[] | null,
        valueToBeCompared: typeof value | number,
        predicate: Predicate,
        dayToBeCompared: Date
    ): boolean {
        switch (predicate) {
            case Predicate.CONTAINS:
                return (
                    typeof value === "string" &&
                    filterService.contains(value, valueToBeCompared as string)
                );

            case Predicate.NOT_CONTAINS:
                return (
                    typeof value === "string" &&
                    !filterService.contains(value, valueToBeCompared as string)
                );
            case Predicate.EQUALS:
                return (
                    typeof value === "string" &&
                    filterService.equals(value, valueToBeCompared as string)
                );
            case Predicate.NOT_EQUALS:
                return (
                    typeof value === "string" &&
                    !filterService.equals(value, valueToBeCompared as string)
                );
            case Predicate.LESS_THAN:
                if (value instanceof Date) {
                    console.log(dayToBeCompared.toDateString());
                    console.log(value.toDateString());

                    return filterService.greaterThan(value, dayToBeCompared);
                }
                return false;
            default:
                return false;
        }
    }
}

export default new EmailActions();
