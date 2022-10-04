export enum Environment {
    PORT = "PORT",
    GOOGLE_CLIENT_ID = "GOOGLE_CLIENT_ID",
    GOOGLE_CLIENT_SECRET = "GOOGLE_CLIENT_SECRET",
    SERVER_URI = "SERVER_URI",
}

export enum Routes {
    OAUTH_REDIRECT_URI = "/api/oauth/redirect",
}

export interface IGoogleUser {
    email: string;
    name: string;
    picture: string;
}

export interface IUser {
    id?: string;
    username: string;
    email: string;
    profilePic: string;
    createdAt: Date;
    updatedAt: Date;
}
