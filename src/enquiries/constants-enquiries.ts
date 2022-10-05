export const oauthEnquiries = {
    login: {
        type: "confirm",
        message: "Do you want to login with your Google account ?",
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
        type: "input",
        message: "Please enter the query for the field. Format: fieldname:predicate:value",
        name: "query",
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
        type: "input",
        message: "where do you want to move messages ?",
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
