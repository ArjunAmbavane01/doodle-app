// import Env from "./env";

export const BASE_HTTP_URL = process.env.BACKEND_HTTP_URL;
export const BASE_WS_URL = process.env.BACKEND_WS_URL;

export const HTTP_API_URL = BASE_HTTP_URL + "/api";
export const LOGIN_URL = HTTP_API_URL + "/auth/login";
export const CREATE_ROOM_URL = HTTP_API_URL + "/room";
