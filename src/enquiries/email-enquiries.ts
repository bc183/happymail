import inquirer from "inquirer";
import emailActions from "../actions/email-actions";
import { chalkAlert, chalkInfo } from "../logger";
import mailStore from "../store/mail-store";
import { IQuery, Predicate, QueryFields } from "../types";
import { exitApp, writeToFile } from "../utils";
import { actionEnquiries, emailEnquiries, filterEnquiries } from "./constants-enquiries";
import path from "path";

class EmailEnquiries {
    constructor() {
        this.generateQuery = this.generateQuery.bind(this);
        this.getEmails = this.getEmails.bind(this);
    }

    /**
     * @description Asks questions related to email fetching.
     */
    async getEmails() {
        // get the no of emails to fetch.
        const answers = await inquirer.prompt([emailEnquiries.getEmailCount]);

        if (answers[emailEnquiries.getEmailCount.name]) {
            // get count
            const value = +answers[emailEnquiries.getEmailCount.name];
            // fetch all emails from google.
            const mails = await emailActions.fetchEmailList(value);

            // store email in local store.
            mailStore.mails = mails;

            // generate query to filter emails.
            await this.generateQuery();
        } else {
            exitApp("Goodbye!");
        }
    }

    private _generatePredicateQuery(field: QueryFields) {
        const query = filterEnquiries.filterPredicateQuery as any;
        if (field !== QueryFields.RECIEVED_AT) {
            query.choices = [
                Predicate.CONTAINS,
                Predicate.NOT_CONTAINS,
                Predicate.EQUALS,
                Predicate.NOT_EQUALS,
            ];
        } else {
            query.choices = [Predicate.GREATER_THAN, Predicate.LESS_THAN];
        }

        return query;
    }

    /**
     * @description Asks questions about the email filter and generates the query object
     */
    async generateQuery() {
        try {
            //ask questions for filtering.
            const filters: { field: QueryFields; predicate: Predicate; value: string | number }[] =
                [];
            const fieldsThatCanBeFiltered = Object.values(QueryFields);

            // ask if they want to add a filter.
            const isFilterResponse = await inquirer.prompt([filterEnquiries.addFilterQuery]);

            if (isFilterResponse[filterEnquiries.addFilterQuery.name]) {
                // loop to get all the filters to be added.
                while (fieldsThatCanBeFiltered.length > 0) {
                    const fieldResponse = await inquirer.prompt([filterEnquiries.filterFieldQuery]);
                    const field = fieldResponse[filterEnquiries.filterFieldQuery.name];

                    const predicateResponse = await inquirer.prompt(
                        this._generatePredicateQuery(field)
                    );
                    const predicate = predicateResponse[filterEnquiries.filterPredicateQuery.name];

                    const valueResponse = await inquirer.prompt([filterEnquiries.filterValueQuery]);
                    const value = valueResponse[filterEnquiries.filterValueQuery.name];

                    // push all the filters to the filter array.
                    filters.push({
                        field,
                        predicate,
                        value,
                    });

                    //ask if they want to add another filter.
                    const responses = await inquirer.prompt([filterEnquiries.addFilterQueryLoop]);

                    if (!responses[filterEnquiries.addFilterQueryLoop.name]) {
                        break;
                    }
                }
            }

            // ask if they want to match all filters or any of the filters
            const matchAllResponse = await inquirer.prompt([filterEnquiries.matchAllQuery]);

            // generateQuery object
            const query: IQuery = {
                matchAll: matchAllResponse[filterEnquiries.matchAllQuery.name],
                query: filters,
            };

            // get actions.
            const addActionResponse = await inquirer.prompt([actionEnquiries.addActionQuery]);

            if (addActionResponse[actionEnquiries.addActionQuery.name]) {
                const moveResponse = await inquirer.prompt([actionEnquiries.moveQuery]);
                const value = moveResponse[actionEnquiries.moveQuery.name];

                const markAsReadResponse = await inquirer.prompt([actionEnquiries.markReadQuery]);

                // complete query object
                query.actions = {
                    move: {
                        label: value,
                    },
                    markAsRead: markAsReadResponse[actionEnquiries.markReadQuery.name] === "READ",
                };
            }

            // write queries to file.
            const pathName = path.resolve(__dirname, "../../");

            await writeToFile(path.join(pathName, "query.json"), JSON.stringify(query));

            //filter mail.
            if (query.query.length > 0) {
                const filteredMails = emailActions.filterMail(query);

                if (filteredMails.length > 0 && query.actions) {
                    // perform actions.
                    await emailActions.performActions(query, filteredMails);

                    chalkInfo("Actions performed");
                    chalkInfo("Writing results to file....");
                    await writeToFile(
                        path.join(pathName, "results.json"),
                        JSON.stringify(filteredMails)
                    );
                } else {
                    if (filteredMails.length === 0) {
                        chalkAlert("No emails matches the given filter.");
                    }
                }
            }

            chalkInfo("Your query has been saved in query.json file.");
            chalkInfo("Your results has been saved in results.json file.");
            chalkInfo("It's been nice working with you. See ya later. Bye!");
            exitApp();
        } catch (error) {
            exitApp("Goodbye");
        }
    }
}

export default new EmailEnquiries();
