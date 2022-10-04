import { IMail } from "../types";

class MailStore {
    private _mails: IMail[] = [];

    public get mails(): IMail[] {
        return this._mails;
    }

    public set mails(value: IMail[]) {
        this._mails = value;
    }
}

export default new MailStore();
