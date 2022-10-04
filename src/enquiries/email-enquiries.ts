import inquirer from "inquirer";
import emailActions from "../actions/email-actions";
import { exitApp } from "../utils";
import { emailEnquiries } from "./constants-enquiries";

class EmailEnquiries {
    async getEmails() {
        const answers = await inquirer.prompt([emailEnquiries.getEmailCount]);

        if (answers[emailEnquiries.getEmailCount.name]) {
            const value = +answers[emailEnquiries.getEmailCount.name];
            const mails = await emailActions.fetchEmailList(value);
            console.log(mails?.length);
        } else {
            exitApp("Goodbye!");
        }
    }
}

export default new EmailEnquiries();
