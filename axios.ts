import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const instance = axios.create({
    baseURL: API_URL,
});

instance.interceptors.response.use(
    (response) => {
        const { data } = response;
        return response.data;
    }
);

export default instance;