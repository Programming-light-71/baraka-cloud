import { getUserFromSession } from "./CookieManager";

export async function requireAuth(request: Request) {
  const user = await getUserFromSession(request);

  if (!user || user === null || !user.email || !user.id) {
    return Response.redirect("/login?error=Unauthorized");
  }

  return user; // User is authenticated
}
