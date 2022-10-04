import inquirer from "inquirer";
import emailActions from "../actions/email-actions";
import mailStore from "../store/mail-store";
import { exitApp } from "../utils";
import { emailEnquiries } from "./constants-enquiries";
import query from "../query.json";
import { IQuery } from "../types";

class EmailEnquiries {
    async getEmails() {
        const answers = await inquirer.prompt([emailEnquiries.getEmailCount]);

        if (answers[emailEnquiries.getEmailCount.name]) {
            const value = +answers[emailEnquiries.getEmailCount.name];
            const mails = await emailActions.fetchEmailList(value);
            mailStore.mails = mails;
            console.log(query);

            // filter mail.
            const filteredMails = emailActions.filterMail(query as IQuery);
            filteredMails.forEach((mail) => console.log(mail.from));
        } else {
            exitApp("Goodbye!");
        }
    }
}

export default new EmailEnquiries();
