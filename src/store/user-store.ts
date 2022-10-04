import { IUser } from "../types";

class UserStore {
    private _user: IUser | null = null;
    private _accessToken: string | null = null;
    private _refreshToken: string | null = null;

    public get user(): IUser {
        const val = this._user;
        if (!val) {
            throw new Error("User not found Login again.");
        }
        return val;
    }

    public set user(user: IUser | null) {
        if (user) {
            this._user = {
                ...user,
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
