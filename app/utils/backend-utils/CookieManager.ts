import { createCookieSessionStorage } from "@remix-run/node"; // Import Remix's built-in cookie utility

export const { commitSession, destroySession, getSession } =
  createCookieSessionStorage({
    cookie: {
      name: "authToken",
      sameSite: "lax", // Helps prevent CSRF attacks
      httpOnly: true, // Prevent JavaScript access (secure)
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      secrets: [
        (process.env.COOKIE_SECRET as string) || "cookie default secreT",
      ],
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  });

export const storeUserInSession = async (user: {
  email: string;
  id: string;
}) => {
  const session = await getSession();
  session.set("user", user);
  const header = await commitSession(session);
  return header;
};

export const getUserFromSession = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  return user;
};

export const destroySessionAndLogout = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  session.unset("user");
  const header = await destroySession(session);
  return header;
};

// Remove user from session
export const removeUserFromSession = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  session.unset("user");
  const header = await commitSession(session);
  return header;
};
