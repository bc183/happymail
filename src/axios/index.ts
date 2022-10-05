import axios from "axios";
import oauthActions from "../actions/oauth-actions";
import userStore from "../store/user-store";
import { Environment } from "../types";
import { getEnv } from "../utils";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
    (request) => {
        request.headers = {
            Authorization: `Bearer ${userStore.accessToken}`,
        };
        return request;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response, config } = error;

        if (response.status !== 401) {
            return Promise.reject(error);
        }

        console.log("refreshing token");

        // Use a 'clean' instance of axios without the interceptor to refresh the token. No more infinite refresh loop.
        const { access_token } = await oauthActions.getTokens({
            clientId: getEnv(Environment.GOOGLE_CLIENT_ID),
            clientSecret: getEnv(Environment.GOOGLE_CLIENT_SECRET),
            refreshToken: userStore.refreshToken as string,
            grantType: "refresh_token",
        });

        userStore.accessToken = access_token;

        return axiosInstance(config);
    }
);

export default axiosInstance;
