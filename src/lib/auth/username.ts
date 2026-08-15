/**
 * The librarian's username — always this, on every deployment.
 *
 * Its own module, separate from `config.ts`, because the sign-in form and the
 * admin topbar are Client Components: importing the config would pull a module
 * that reads `ADMIN_EMAILS` and `AUTH_SECRET` at the top level into the browser
 * bundle. Those would be replaced with `undefined` rather than leaked, but a
 * server-secret module has no business being reachable from client code at all.
 *
 * A constant rather than an environment variable because it is an identity, not
 * a configuration: it is what the account is *called*, so it is the same string
 * in the sign-in form, the admin topbar and the catalogue bar. It is not a
 * secret and grants nothing on its own — the email address is what is checked.
 */
export const adminUsername = "pediatric-book-bank";
