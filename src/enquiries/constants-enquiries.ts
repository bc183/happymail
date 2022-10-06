import { Labels, QueryFields } from "../types";

export const oauthEnquiries = {
    login: {
        type: "confirm",
        message: "Do you want to login using your Google account ?",
        name: "login",
        default: true,
    },
};

export const emailEnquiries = {
    getEmailCount: {
        type: "number",
        message: "How many email do you want to fetch ?",
        name: "emailCount",
        default: 10,
    },
};

export const filterEnquiries = {
    filterFieldQuery: {
        type: "list",
        message: "Please select the field that you want to filter by.",
        choices: Object.values(QueryFields),
        name: "field",
    },
    filterPredicateQuery: {
        type: "list",
        message: "Please select the predicate for the field.",
        choices: [],
        name: "predicate",
    },
    filterValueQuery: {
        type: "input",
        message: "Please enter the value to be compared.",
        name: "value",
    },
    addFilterQueryLoop: {
        type: "confirm",
        message: "Do you want to add another filter ?",
        name: "addFilterLoop",
        default: true,
    },
    addFilterQuery: {
        type: "confirm",
        message: "Do you want to add a filter ?",
        name: "addFilter",
        default: true,
    },
    matchAllQuery: {
        type: "confirm",
        message: "Do you want all the filters to match ?",
        default: true,
        name: "matchAll",
    },
};

export const actionEnquiries = {
    addActionQuery: {
        type: "confirm",
        message: "Do you want to perfom actions ?",
        name: "addAction",
        default: true,
    },
    moveQuery: {
        type: "list",
        message: "where do you want to move messages ?",
        choices: Object.values(Labels).filter((label) => label !== Labels.UNREAD),
        name: "move",
        default: "SPAM",
    },
    markReadQuery: {
        type: "list",
        message: "Do you want to mark the messages as read or unread ?",
        choices: ["READ", "UNREAD"],
        name: "markRead",
        default: "READ",
    },
};
