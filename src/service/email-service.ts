import db from "../database";
import userStore from "../store/user-store";
import { IMail } from "../types";
import userService from "./user-service";

class EmailService {
    async saveEmail(email: IMail) {
        try {
            const user = await userService.getUserByEmail(userStore.user.email);
            if (!user) {
                throw new Error(`User with this ${email} not found, Kindly login again`);
            }
            const savedEmail = db.emails.create({
                data: {
                    ...email,
                    userId: user.id,
                    labels: {
                        create: [...email.labels],
                    },
                },
            });
            return savedEmail;
        } catch (error) {
            throw new Error("Couldn't save email");
        }
    }
}

export default new EmailService();
