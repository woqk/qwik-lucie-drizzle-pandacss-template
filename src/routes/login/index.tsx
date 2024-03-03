// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
import { $, component$, type QRL } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { InitialValues, SubmitHandler } from '@modular-forms/qwik';
import { formAction$, useForm, valiForm$ } from '@modular-forms/qwik';
import { Argon2id } from "oslo/password";
import { email, type Input, minLength, object, string } from 'valibot';
import { lucia } from '~/lib/auth';
import { db } from '~/db/db';
import { users } from '~/db/schema';
import { eq } from "drizzle-orm";

const LoginSchema = object({
    email: string([
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.'),
    ]),
    password: string([
        minLength(1, 'Please enter your password.'),
        minLength(8, 'Your password must have 8 characters or more.'),
    ]),
});

type LoginForm = Input<typeof LoginSchema>;

export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
    email: '',
    password: '',
}));

export const useFormAction = formAction$<LoginForm>(async (values, event) => {
    // Runs on server
    console.log("Works", values);

    const [existingUser] = await db.select().from(users).where(eq(users.email, values.email));
    if (!existingUser) {
        return event.fail(400, {
            message: "Incorrect username or password",
            form
        });
    }

    const validPassword = await new Argon2id().verify(existingUser.hashedPassword, values.password);
    console.log("Not valid", validPassword);

    if (!validPassword) {
        return event.fail(400, {
            message: "Incorrect username or password",
        });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
    });

    event.redirect(302, "/");
}, valiForm$(LoginSchema));

export default component$(() => {
    const [loginForm, { Form, Field }] = useForm<LoginForm>({
        loader: useFormLoader(),
        action: useFormAction(),
        validate: valiForm$(LoginSchema),
    });

    const handleSubmit: QRL<SubmitHandler<LoginForm>> = $((values) => {
        // Runs on client
        console.log(values);
    });

    return (
        <Form onSubmit$={handleSubmit}>
            <label>Email</label>
            <Field name="email">
                {(field, props) => (
                    <div>
                        <input {...props} type="email" value={field.value} />
                        {field.error && <div>{field.error}</div>}
                    </div>
                )}
            </Field>
            <label>Password</label>
            <Field name="password">
                {(field, props) => (
                    <div>
                        <input {...props} type="password" value={field.value} />
                        {field.error && <div>{field.error}</div>}
                    </div>
                )}
            </Field>
            <button type="submit">Login</button>
        </Form>
    );
});