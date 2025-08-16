import { createCookie, createCookieSessionStorage } from "react-router";
import { getUsers, ENV } from "./config";

// Create session storage
const sessionCookie = createCookie("__session", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60, // 1 hour
  secrets: [ENV.SESSION_SECRET], // Add secret for signing
});

export const sessionStorage = createCookieSessionStorage({
  cookie: sessionCookie,
});

export interface SessionUser {
  username: string;
  name: string;
  canDownload?: boolean;
}

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUser(request: Request): Promise<SessionUser | null> {
  const session = await getSession(request);
  const username = session.get("username");
  const name = session.get("name");
  
  if (username && name) {
    // Get the user's current permissions from the users file
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    return { 
      username, 
      name,
      canDownload: user?.canDownload || false
    };
  }
  
  return null;
}

export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await getUser(request);
  
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  
  return user;
}

export async function login(username: string, password: string) {
  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  
  return user;
}

export async function createUserSession(username: string, name: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("username", username);
  session.set("name", name);
  
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
