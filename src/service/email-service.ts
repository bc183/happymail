import db from "../database";
import userStore from "../store/user-store";
import { IMail } from "../types";
import userService from "./user-service";

class EmailService {
    async saveEmail(email: IMail) {
        try {
            const user = await userService.getUserByEmail(userStore.user.email);

            const existingLabels = await db.labels.findMany({
                where: {
                    label: {
                        in: email.labels.map((label) => label.label),
                    },
                },
            });
            console.log(existingLabels);
            const justLabels = existingLabels.map((label) => label.label);
            const justIds = existingLabels.map((label) => {
                return { id: label.id };
            });
            email.labels = email.labels.filter((label) => !justLabels.includes(label.label));

            if (!user) {
                throw new Error(`User with this ${email} not found, Kindly login again`);
            }
            const savedEmail = db.emails.create({
                data: {
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                    ...email,
                    labels: {
                        connect: justIds,
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
