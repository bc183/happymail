import { IMail } from "../types";
import { base64ToString } from "../utils";

class MailStore {
    private _mails: IMail[] = [];

    public get mails(): IMail[] {
        return this._mails;
    }

    public set mails(value: IMail[]) {
        value = value.map((v) => {
            return {
                ...v,
                body: v.body ? base64ToString(v.body) : null,
            };
        });
        this._mails = value;
    }
}

export default new MailStore();
