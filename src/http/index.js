import axios from "axios";

const $host = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const $authHost = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const authInterceptor = (config) => {
  config.headers.authorization = `Token ${localStorage.getItem("key")}`;
  return config;
};

$authHost.interceptors.request.use(authInterceptor);
$authHost.interceptors.response.use(
  (response) => {
    return response;
  },
);

export { $host, $authHost };
