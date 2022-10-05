import userStore from "../../store/user-store";

describe("EmailActions", () => {
    describe("fetchEmailList", () => {
        beforeAll(() => {
            userStore.user = {
                email: "test@example.com",
                username: "test",
                accessToken: "",
                refreshToken: "",
            };
        });
        it("Should fetch email successfully", () => {
            // introduce mocks.
            const count = 20;
        });
    });
});
