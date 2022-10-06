import emailActions from "../../actions/email-actions";
import mailStore from "../../store/mail-store";
import { IQuery, Predicate, QueryFields } from "../../types";
import { mails } from "../helper";

describe("EmailActions", () => {
    describe("filterMail", () => {
        beforeEach(() => {
            Object.defineProperty(mailStore, "mails", {
                get: jest.fn(() => mails),
                set: jest.fn(),
                configurable: true,
            });
        });
        it("Should fetch filter email successfully for single field (Contains).", () => {
            // given
            const query: IQuery = {
                matchAll: true,
                query: [
                    {
                        field: QueryFields.FROM,
                        predicate: Predicate.CONTAINS,
                        value: "barath",
                    },
                ],
            };

            // excute
            const actualMails = emailActions.filterMail(query);

            // compare
            expect(actualMails.length).toEqual(1);
            expect(actualMails[0].from).toEqual(mails[0].from);
            expect(actualMails[0].subject).toEqual(mails[0].subject);
        });

        it("Should fetch filter email successfully for single field. (Not Contains)", () => {
            // given
            const query: IQuery = {
                matchAll: true,
                query: [
                    {
                        field: QueryFields.SUBJECT,
                        predicate: Predicate.NOT_CONTAINS,
                        value: "Riya",
                    },
                ],
            };

            // excute
            const actualMails = emailActions.filterMail(query);

            // compare
            expect(actualMails.length).toEqual(2);
            expect(actualMails[0].from).toEqual(mails[0].from);
            expect(actualMails[0].subject).toEqual(mails[0].subject);
        });

        it("Should fetch filter email successfully for single field. (Equals)", () => {
            // given
            const query: IQuery = {
                matchAll: true,
                query: [
                    {
                        field: QueryFields.FROM,
                        predicate: Predicate.EQUALS,
                        value: "Test <test@gmail.com>",
                    },
                ],
            };

            // excute
            const actualMails = emailActions.filterMail(query);

            // compare
            expect(actualMails.length).toEqual(0);
        });

        it("Should fetch filter email successfully for single field. (Not Equals)", () => {
            // given
            const query: IQuery = {
                matchAll: true,
                query: [
                    {
                        field: QueryFields.FROM,
                        predicate: Predicate.NOT_EQUALS,
                        value: "Test <test@gmail.com>",
                    },
                ],
            };

            // excute
            const actualMails = emailActions.filterMail(query);

            // compare
            expect(actualMails.length).toEqual(3);
            expect(actualMails[0].from).toEqual(mails[0].from);
            expect(actualMails[0].subject).toEqual(mails[0].subject);
        });

        it("Should fetch filter email successfully for single field. (Less than)", () => {
            // given
            const query: IQuery = {
                matchAll: true,
                query: [
                    {
                        field: QueryFields.RECIEVED_AT,
                        predicate: Predicate.LESS_THAN,
                        value: 1,
                    },
                ],
            };

            // excute
            const actualMails = emailActions.filterMail(query);

            // compare
            expect(actualMails.length).toEqual(1);
            expect(actualMails[0].from).toEqual(mails[2].from);
            expect(actualMails[0].subject).toEqual(mails[2].subject);
        });

        it("Should fetch filter email successfully for single field. (Greater than)", () => {
            // given
            const query: IQuery = {
                matchAll: true,
                query: [
                    {
                        field: QueryFields.RECIEVED_AT,
                        predicate: Predicate.GREATER_THAN,
                        value: 1,
                    },
                ],
            };

            // excute
            const actualMails = emailActions.filterMail(query);

            // compare
            expect(actualMails.length).toEqual(2);
            expect(actualMails[0].from).toEqual(mails[0].from);
            expect(actualMails[0].subject).toEqual(mails[0].subject);
        });
        it("Should fetch filter email successfully for multiple fields. (Match All)", () => {
            // given
            const query: IQuery = {
                matchAll: true,
                query: [
                    {
                        field: QueryFields.RECIEVED_AT,
                        predicate: Predicate.LESS_THAN,
                        value: 1,
                    },
                    {
                        field: QueryFields.FROM,
                        predicate: Predicate.CONTAINS,
                        value: "riya",
                    },
                ],
            };

            // excute
            const actualMails = emailActions.filterMail(query);

            // compare
            expect(actualMails.length).toEqual(1);
            expect(actualMails[0].from).toEqual(mails[2].from);
            expect(actualMails[0].subject).toEqual(mails[2].subject);
        });

        it("Should fetch filter email successfully for multiple fields. (Match Any)", () => {
            // given
            const query: IQuery = {
                matchAll: false,
                query: [
                    {
                        field: QueryFields.RECIEVED_AT,
                        predicate: Predicate.GREATER_THAN,
                        value: 2,
                    },
                    {
                        field: QueryFields.FROM,
                        predicate: Predicate.CONTAINS,
                        value: "riya",
                    },
                ],
            };

            // excute
            const actualMails = emailActions.filterMail(query);

            // compare
            expect(actualMails.length).toEqual(3);
            expect(actualMails[0].from).toEqual(mails[0].from);
            expect(actualMails[0].subject).toEqual(mails[0].subject);
        });
    });
});
