/* eslint-disable indent */
import axios from "axios";
import chalk from "chalk";
import emailService from "../service/email-service";
import filterService from "../service/filter-service";
import mailStore from "../store/mail-store";
import userStore from "../store/user-store";
import { GmailHeaders, IGMail, IGMailList, IMail, IQuery, Labels, Predicate } from "../types";
import { getMailListUrl, getMailModifyUrl, getMailUrl, subractDays } from "../utils";

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

    filterMail(queryObject: IQuery) {
        try {
            const queries = queryObject.query;
            const filterFunction = (mail: IMail) => {
                for (const query of queries) {
                    const predicate = query.predicate;
                    const value = mail[query.field];
                    const valueToBeCompared = query.value;
                    const toBeTaken = this._performFilter(value, valueToBeCompared, predicate);

                    if (toBeTaken && !queryObject.matchAll) {
                        return true;
                    } else if (!toBeTaken && queryObject.matchAll) {
                        return false;
                    }
                }

                return queryObject.matchAll;
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
        predicate: Predicate
    ): boolean {
        let dayToBeCompared = new Date();
        if (value instanceof Date) {
            dayToBeCompared = subractDays(dayToBeCompared, valueToBeCompared as number);
        }
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
            case Predicate.GREATER_THAN:
                if (value instanceof Date) {
                    console.log(dayToBeCompared.toDateString());
                    console.log(value.toDateString());

                    return filterService.lessThan(value, dayToBeCompared);
                }
                return false;
            default:
                return false;
        }
    }

    performActions(query: IQuery, filteredMails: IMail[]): boolean {
        try {
            const actions = query.actions;
            const lablesToBeAdded: Labels[] = [];
            const lablesToBeRemoved: Labels[] = [];

            if (actions?.move) {
                lablesToBeAdded.push(actions.move.label);
            }

            if (actions?.markAsRead) {
                lablesToBeRemoved.push(Labels.UNREAD);
            }

            const user = userStore.user;

            if (lablesToBeAdded.length > 0 && lablesToBeRemoved.length > 0) {
                for (const mail of filteredMails) {
                    this.modifyMail(user.email, mail.messageId, lablesToBeAdded, lablesToBeRemoved);
                }
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    private async modifyMail(
        userMail: string,
        messageId: string,
        lablesToBeAdded: Labels[] = [],
        labelsToBeRemoved: Labels[] = []
    ): Promise<boolean> {
        try {
            await axios.post(
                getMailModifyUrl(userMail, messageId),
                {
                    addLabelIds: lablesToBeAdded,
                    removeLabelIds: labelsToBeRemoved,
                },
                {
                    headers: {
                        Authorization: `Bearer ${userStore.accessToken}`,
                    },
                }
            );
            return true;
        } catch (error) {
            throw error;
        }
    }
}

export default new EmailActions();
