/* eslint-disable indent */
import chalk from "chalk";
import axiosInstance from "../axios";
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

    /**
     * @description fetches given no of emails from the GMail API.
     * @param count
     * @returns List of emails
     */
    async fetchEmailList(count: number): Promise<IMail[]> {
        try {
            // fetch the user.
            const user = userStore.user;
            const mails: IMail[] = [];
            // perform only if user exists i.e logged in.
            if (user) {
                console.log(chalk.italic("Fetching emails..."));

                // Google has a restriction of maxCount of 500. so if the count is
                // greaterThan 500, we perform the fetching in batches.
                const batches = count > 500 ? Math.ceil(count / 500) : 1;
                for (let batch = 0; batch < batches; batch++) {
                    // token for the next page
                    let nextPageToken: string | null = null;

                    // fetch mail list frpom google.
                    const mailList = await axiosInstance.get<IGMailList>(
                        getMailListUrl(user.email),
                        {
                            params: {
                                labelsIds: "INBOX",
                                maxResults: count > 500 ? 500 : count,
                                pageToken: nextPageToken,
                            },
                        }
                    );

                    nextPageToken = mailList.data.nextPageToken;
                    const messages = mailList.data?.messages;

                    // In the list api google sends only the id of the mail. We need hit another endpoint to get the entire message.
                    // Here, the challenge is whenever we make more than 100 requests at the same time or concurrently, Google throws a 429
                    // error 'Too many requests'. To avoid that whenever the count > 100, we are fetching the maills in batches.
                    await this._getMailInBatches(messages, messages.length, mails);
                }

                console.log(mails.length);

                console.log(chalk.italic("Email fetched..."));
            }

            // save to db
            mails.forEach(emailService.saveEmail);

            return mails;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * @description Fetches individual mail in batches.
     * @param messages
     * @param count
     * @param result
     */
    private async _getMailInBatches(messages: { id: string }[], count: number, result: IMail[]) {
        const user = userStore.user;
        let start = 0;
        const batches = count > 100 ? Math.ceil(count / 100) : 1;
        console.log(batches);

        for (let batch = 0; batch < batches; batch++) {
            // extract the batch from the orginal array.
            const messagesBatch = messages.slice(start, start + 100);
            // we store all the promises in an array and execute them concurrently.
            // To reduce the time taken to fetch them.
            const emailPromises = [];
            for (const message of messagesBatch) {
                emailPromises.push(axiosInstance.get<IGMail>(getMailUrl(user.email, message.id)));
            }

            // execute all the promises.
            const fetchedMailData = (await Promise.all(emailPromises)).map((v) => v.data);

            // push the results.
            result.push(...fetchedMailData.map(this._processGMailData));

            // next batch start
            start = start + 100;
        }
    }

    /**
     * @description process the GMail data to our own format of IMail
     * @param data
     * @returns The processed GMail data
     */
    private _processGMailData(data: IGMail): IMail {
        try {
            const neededHeaders: Record<string, string> = {};

            // all the metadata are stored in the headers of the response.
            // i.e. from, to, subject etc.
            for (const header of data.payload.headers) {
                if (Object.values(GmailHeaders).includes(header.name as GmailHeaders)) {
                    neededHeaders[header.name] = header.value;
                }
            }

            // extract the body of the mail.
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
                labels: data.labelIds.map((label) => {
                    return { label: label };
                }),
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * @description Filters the emails based on the query given.
     * @param queryObject
     * @returns the mails matching the query.
     */
    filterMail(queryObject: IQuery) {
        try {
            const queries = queryObject.query;

            // the filter callback passed to the filter function of Array.
            const filterFunction = (mail: IMail) => {
                for (const query of queries) {
                    const predicate = query.predicate;

                    // get the value from the mail object to compare
                    const value = mail[query.field];
                    const valueToBeCompared = query.value;

                    // toBeTaken contains whether the value passed the filter check.
                    const toBeTaken = this._performFilter(value, valueToBeCompared, predicate);

                    // since we have matchAll or matchAny, we just check and return immediately, instead of going
                    // through the whole loop.
                    if (toBeTaken && !queryObject.matchAll) {
                        return true;
                    } else if (!toBeTaken && queryObject.matchAll) {
                        return false;
                    }
                }

                // if matchAll is true && value passed all the filter checks. or if matchAll is false and the
                // did not pass any of the filter checks.
                return queryObject.matchAll;
            };

            // filter.
            const filteredMails = mailStore.mails.filter(filterFunction);

            return filteredMails;
        } catch (error) {
            throw error;
        }
    }

    /**
     * @description compare two values based on Predicate
     * @param value
     * @param valueToBeCompared
     * @param predicate
     * @returns True or False based on the Predicate
     */
    private _performFilter(
        value: string | Date | string[] | null,
        valueToBeCompared: typeof value | number,
        predicate: Predicate
    ): boolean {
        let dayToBeCompared = new Date();

        // if value is data compute the dayToBeCompared.
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
                // fetches the email which is greaterThan the dayToBeCompared
                // eg: given less than 2 days old, we need to fetch all the emails
                // with date > current date - 2 days.
                if (value instanceof Date) {
                    return filterService.greaterThan(value, dayToBeCompared);
                }
                return false;
            case Predicate.GREATER_THAN:
                // fetches the email which is lessThan the dayToBeCompared
                // eg: given greater than 2 days old, we need to fetch all the emails
                // with date < current date - 2 days.
                if (value instanceof Date) {
                    return filterService.lessThan(value, dayToBeCompared);
                }
                return false;
            default:
                return false;
        }
    }

    /**
     * @description Perform actions on the given list of emails based on the query.
     * @param query
     * @param filteredMails
     * @returns True if the action are performed successfully.
     */
    async performActions(query: IQuery, filteredMails: IMail[]): Promise<boolean> {
        try {
            const actions = query.actions;
            const lablesToBeAdded: Labels[] = [];
            const lablesToBeRemoved: Labels[] = [];

            if (actions?.move) {
                lablesToBeAdded.push(actions.move.label);
            }

            // to mark as read, we removed the lable UNREAD, to mark as UNREAD, we push the label UNREAD.
            if (actions?.markAsRead) {
                lablesToBeRemoved.push(Labels.UNREAD);
            } else {
                lablesToBeAdded.push(Labels.UNREAD);
            }

            const user = userStore.user;

            if (lablesToBeAdded.length > 0 || lablesToBeRemoved.length > 0) {
                // fetch all messageIds.
                const messageIds = filteredMails.map((mail) => mail.messageId);

                // we modify the mails in bulk.
                await this.modifyMail(user.email, messageIds, lablesToBeAdded, lablesToBeRemoved);
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * @description Modifies the mail by accessing the GMail API.
     * @param userMail
     * @param messageIds
     * @param lablesToBeAdded
     * @param labelsToBeRemoved
     *
     */
    private async modifyMail(
        userMail: string,
        messageIds: string[],
        lablesToBeAdded: Labels[] = [],
        labelsToBeRemoved: Labels[] = []
    ): Promise<boolean> {
        try {
            await axiosInstance.post(getMailModifyUrl(userMail), {
                ids: messageIds,
                addLabelIds: lablesToBeAdded,
                removeLabelIds: labelsToBeRemoved,
            });
            return true;
        } catch (error) {
            throw error;
        }
    }
}

export default new EmailActions();
