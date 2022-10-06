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

            const justLabels = existingLabels.map((label) => label.label);
            const justIds = existingLabels.map((label) => {
                return { id: label.id };
            });

            const labelsToBeCreated = email.labels.filter(
                (label) => !justLabels.includes(label.label)
            );

            if (!user) {
                throw new Error(`User with this ${email} not found, Kindly login again`);
            }
            const savedEmail = await db.emails.create({
                data: {
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                    ...email,
                    labels: {
                        connect: justIds,
                        create: labelsToBeCreated,
                    },
                },
            });
            return savedEmail;
        } catch (error) {
            console.log(error);
            throw new Error("Couldn't save email");
        }
    }
}

export default new EmailService();
