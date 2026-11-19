export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

// Usernames will become profile urls, so certain words must be prohibited - will update as I think of more
export const RESERVED_USERNAMES = [
  "admin",
  "api",
  "app",
  "about",
  "help",
  "login",
  "logout",
  "signin",
  "signup",
  "settings",
  "games",
  "game",
  "lists",
  "list",
  "members",
  "member",
  "search",
  "profile",
  "user",
  "users",
  "u",
  "me",
  "new",
  "edit",
  "terms",
  "privacy",
];

// helper function used by other modules
export function isReservedUsername(value: string) {
  return RESERVED_USERNAMES.includes(value.toLowerCase());
}
