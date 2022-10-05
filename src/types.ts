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

export interface IGMailList {
    messages: {
        id: string;
    }[];
    nextPageToken: string;
}

export enum GmailHeaders {
    FROM = "From",
    TO = "To",
    SUBJECT = "Subject",
    DATE = "Date",
    CONTENT_TYPE = "Content-Type",
    CC = "Cc",
    BCC = "Bc",
}

export interface IGMailMessageBody {
    attachmentId: string;
    size: number;
    data?: string;
}

export interface IGMailPayload {
    headers: [
        {
            name: string;
            value: string;
        }
    ];
    body: IGMailMessageBody;
    parts?: [
        {
            body: IGMailMessageBody;
        }
    ];
}

export interface IGMail {
    id: string;
    labelIds: string[];
    snippet: string;
    payload: IGMailPayload;
}

export interface ILabel {
    id?: string;
    label: string;
    emails?: IMail[];
}

export interface IMail {
    messageId: string;
    from: string;
    to: string;
    cc: string;
    bcc: string;
    body: string | null;
    recievedAt: Date;
    subject: string;
    labels: ILabel[];
}

export interface IMailDB extends IMail {
    id: string;
    user: IUser;
}

export enum QueryFields {
    FROM = "from",
    SUBJECT = "subject",
    BODY = "body",
    RECIEVED_AT = "recievedAt",
}

export enum Predicate {
    CONTAINS = "contains",
    NOT_CONTAINS = "notContains",
    EQUALS = "equals",
    NOT_EQUALS = "notEquals",
    LESS_THAN = "lessThan",
    GREATER_THAN = "greaterThan",
}

export enum Labels {
    INBOX = "INBOX",
    UNREAD = "UNREAD",
    SPAM = "SPAM",
    STARRED = "STARRED",
    IMPORTANT = "IMPORTANT",
    CATEGORY_PERSONAL = "CATEGORY_PERSONAL",
    CATEGORY_SOCIAL = "CATEGORY_SOCIAL",
    CATEGORY_PROMOTIONS = "CATEGORY_PROMOTIONS",
    CATEGORY_UPDATES = "CATEGORY_UPDATES",
    CATEGORY_FORUMS = "CATEGORY_FORUMS",
}

export interface IQuery {
    matchAll: boolean;
    query: { field: QueryFields; predicate: Predicate; value: string | number }[];
    actions?: {
        move?: {
            label: Labels;
        };
        markAsRead?: boolean;
    };
}

export interface IUser {
    username: string;
    email: string;
    accessToken: string | null;
    refreshToken: string | null;
}

export interface IUserDB extends IUser {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
