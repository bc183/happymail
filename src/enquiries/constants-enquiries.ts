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
        type: "input",
        message: "How many email do you want to fetch ?",
        name: "emailCount",
        default: 100,
    },
};
