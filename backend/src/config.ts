export const cookieConfig = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
} as const;

export const PORT = 4000;
export const WEB_SOCKET_PORT = 4000;

export const JWT_ACCESS_TOKEN_AGE = "3m";
export const JWT_REFRESH_TOKEN_AGE = "7d";
