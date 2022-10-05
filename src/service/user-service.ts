import db from "../database";
import userStore from "../store/user-store";
import { IGoogleUser, IUser, IUserDB } from "../types";

class UserService {
    async saveUser(user: IGoogleUser): Promise<IUser> {
        try {
            const savedOrUpdatedUser = await db.users.upsert({
                where: {
                    email: user.email,
                },
                update: {},
                create: {
                    username: user.name,
                    email: user.email,
                    accessToken: userStore.accessToken ?? null,
                    refreshToken: userStore.accessToken ?? null,
                },
            });

            return savedOrUpdatedUser;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<IUserDB | null> {
        try {
            const user = await db.users.findFirst({
                where: { email: email },
            });

            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default new UserService();
