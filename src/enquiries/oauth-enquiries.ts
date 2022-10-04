import inquirer from "inquirer";
import oauthActions from "../actions/oauth-actions";
import { exitApp } from "../utils";
import { oauthEnquiries } from "./constants-enquiries";

class OAuthEnquiry {
    async login() {
        const answers = await inquirer.prompt([oauthEnquiries.login]);

        if (answers[oauthEnquiries.login.name]) {
            await oauthActions.login();
        } else {
            exitApp("Goodbye!");
        }
    }
}

export default new OAuthEnquiry();
