import { db } from "~/db//db";
import { type SelectUser, session, users } from "~/db/schema";
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
// import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";
import { Lucia } from "lucia";


// const adapter = new PostgresJsAdapter(queryClient, {
// 	user: "auth_user",
// 	session: "user_session"
// });

const adapter = new DrizzlePostgreSQLAdapter(db, session, users);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: process.env.NODE_ENV === 'production',
        }
    },
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: Omit<SelectUser, "id">;
    }
}
