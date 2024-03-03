import {
    boolean,
    pgTable,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { typeid } from "typeid-js";


export const users = pgTable("auth_user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => typeid("usr").toString()),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false),
    hashedPassword: text("hashed_password"),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const session = pgTable("user_session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
});


export type SelectSession = typeof session.$inferSelect;
export type InsertSession = typeof session.$inferInsert;
