import { IMail } from "../types";
import { subractDays } from "../utils";

const recievedAt2DayLess = subractDays(new Date(), 2);

export const mails: IMail[] = [
    {
        from: "Barath C <msbarath7@gmail.com>",
        to: "Test <test@gmail.com>",
        subject: "Thi is a test mail",
        body: "<h1> I am a test mail </h1>",
        recievedAt: recievedAt2DayLess,
        bcc: "",
        cc: "",
        labels: [],
        messageId: "messageId1",
    },
    {
        from: "Manoj A <amanoj@gmail.com>",
        to: "Test <test@gmail.com>",
        subject: "This is a test mail for manoj",
        body: "<h1> I am a test mail for manoj </h1>",
        recievedAt: recievedAt2DayLess,
        bcc: "",
        cc: "",
        labels: [],
        messageId: "messageId2",
    },
    {
        from: "Riya C <criya@gmail.com>",
        to: "Test <test@gmail.com>",
        subject: "Riya's test mail",
        body: "<h1> It's a test mail fpr Riya </h1>",
        recievedAt: new Date(),
        bcc: "",
        cc: "",
        labels: [],
        messageId: "messageId2",
    },
];
