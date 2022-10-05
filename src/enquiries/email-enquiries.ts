import inquirer from "inquirer";
import emailActions from "../actions/email-actions";
import mailStore from "../store/mail-store";
import { chalkAlert, exitApp } from "../utils";
import { actionEnquiries, emailEnquiries, filterEnquiries } from "./constants-enquiries";
import { IQuery, Labels, Predicate, QueryFields } from "../types";
import chalk from "chalk";

class EmailEnquiries {
    constructor() {
        this.generateQuery = this.generateQuery.bind(this);
        this.getEmails = this.getEmails.bind(this);
    }

    async getEmails() {
        const answers = await inquirer.prompt([emailEnquiries.getEmailCount]);

        if (answers[emailEnquiries.getEmailCount.name]) {
            const value = +answers[emailEnquiries.getEmailCount.name];
            const mails = await emailActions.fetchEmailList(value);
            mailStore.mails = mails;

            // filter mails.
            await this.generateQuery();
        } else {
            exitApp("Goodbye!");
        }
    }

    async generateQuery() {
        try {
            //ask questions for filtering.
            const filters: { field: QueryFields; predicate: Predicate; value: string | number }[] =
                [];
            const fieldsThatCanBeFiltered = Object.values(QueryFields);
            const predicatesThatCanBeEntered = Object.values(Predicate);
            const isFilterResponse = await inquirer.prompt([filterEnquiries.addFilterQuery]);

            if (isFilterResponse[filterEnquiries.addFilterQuery.name]) {
                while (fieldsThatCanBeFiltered.length > 0) {
                    let responses = await inquirer.prompt([filterEnquiries.filterFieldQuery]);

                    const [field, predicate, value] =
                        responses[filterEnquiries.filterFieldQuery.name].split(":");

                    if (!fieldsThatCanBeFiltered.includes(field)) {
                        console.log(chalk.red("You must enter valid fields"));
                        continue;
                    }

                    if (!predicatesThatCanBeEntered.includes(predicate)) {
                        chalkAlert("You must enter valid predicate");
                        continue;
                    }

                    filters.push({
                        field,
                        predicate,
                        value,
                    });

                    responses = await inquirer.prompt([filterEnquiries.addFilterQueryLoop]);

                    if (!responses[filterEnquiries.addFilterQueryLoop.name]) {
                        break;
                    }
                }
            }

            const matchAllResponse = await inquirer.prompt([filterEnquiries.matchAllQuery]);

            console.log(filters);

            const query: IQuery = {
                matchAll: matchAllResponse[filterEnquiries.matchAllQuery.name],
                query: filters,
            };

            // get actions.
            const addActionResponse = await inquirer.prompt([actionEnquiries.addActionQuery]);

            if (addActionResponse[actionEnquiries.addActionQuery.name]) {
                while (!query.actions) {
                    const moveResponse = await inquirer.prompt([actionEnquiries.moveQuery]);
                    const value = moveResponse[actionEnquiries.moveQuery.name];

                    if (!Object.values(Labels).includes(value)) {
                        chalkAlert("Enter valid Label");
                        continue;
                    }

                    const markAsReadResponse = await inquirer.prompt([
                        actionEnquiries.markReadQuery,
                    ]);

                    query.actions = {
                        move: {
                            label: value,
                        },
                        markAsRead:
                            markAsReadResponse[actionEnquiries.markReadQuery.name] === "READ",
                    };

                    break;
                }
            }

            console.log(query);

            // filter mail.
            const filteredMails = emailActions.filterMail(query);
            filteredMails.forEach((mail) => console.log(mail.from));

            // perform actions.
            emailActions.performActions(query, filteredMails);
        } catch (error) {
            exitApp("Goodbye");
        }
    }
}

export default new EmailEnquiries();
