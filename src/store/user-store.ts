import { IUser } from "../types";

class UserStore {
    private _user: IUser | null = null;
    private _accessToken: string | null = null;
    private _refreshToken: string | null = null;

    public get user() {
        return this._user;
    }

    public set user(user: Omit<IUser, "createdAt" | "updatedAt"> | null) {
        const currentDate = new Date();
        if (user) {
            this._user = {
                ...user,
                createdAt: currentDate,
                updatedAt: currentDate,
            };
        }
    }

    public get accessToken(): string | null {
        return this._accessToken;
    }

    public set accessToken(value: string | null) {
        this._accessToken = value;
    }

    public get refreshToken(): string | null {
        return this._refreshToken;
    }

    public set refreshToken(value: string | null) {
        this._refreshToken = value;
    }
}

export default new UserStore();
