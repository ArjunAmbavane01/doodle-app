export const BASE_HTTP_URL = process.env.NEXT_PUBLIC_HTTP_BACKEND_URL;
export const BASE_WS_URL = process.env.NEXT_PUBLIC_WS_BACKEND_URL;

export const HTTP_API_URL = BASE_HTTP_URL + "/api/v1";
export const LOGIN_URL = HTTP_API_URL + "/auth/login";
export const CREATE_ROOM_URL = HTTP_API_URL + "/rooms/createRoom";
export const JOIN_ROOM_URL = HTTP_API_URL + "/rooms/joinRoom";
export const CREATE_SVG_URL = HTTP_API_URL + "/canvas/generateSvg";

