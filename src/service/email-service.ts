import db from "../database";
import userStore from "../store/user-store";
import { IMail } from "../types";
import userService from "./user-service";

class EmailService {
    async saveEmail(email: IMail) {
        try {
            const user = await userService.getUserByEmail(userStore.user.email);
            const savedEmail = db.emails.create({
                data: {
                    ...email,
                    userId: user.id,
                },
            });
            return savedEmail;
        } catch (error) {
            throw new Error("Couldn't save email");
        }
    }
}

export default new EmailService();
