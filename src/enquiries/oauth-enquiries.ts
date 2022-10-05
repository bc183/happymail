import inquirer from "inquirer";
import oauthActions from "../actions/oauth-actions";
import { exitApp } from "../utils";
import { oauthEnquiries } from "./constants-enquiries";

class OAuthEnquiry {
    /**
     * @description Asks questions about the OAuth login.
     */
    async login() {
        // ask whether the user wants to be logged in.
        const answers = await inquirer.prompt([oauthEnquiries.login]);

        if (answers[oauthEnquiries.login.name]) {
            // perform authentication
            await oauthActions.login(answers[oauthEnquiries.login.name]);
        } else {
            exitApp("Goodbye!");
        }
    }
}

export default new OAuthEnquiry();
