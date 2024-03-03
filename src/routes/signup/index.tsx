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

const SignupSchema = object({
    email: string([
        minLength(1, 'Please enter your email.'),
        email('The email address is badly formatted.'),
    ]),
    password: string([
        minLength(1, 'Please enter your password.'),
        minLength(8, 'Your password must have 8 characters or more.'),
    ]),
});

type SignupForm = Input<typeof SignupSchema>;

export const useFormLoader = routeLoader$<InitialValues<SignupForm>>(() => ({
    email: '',
    password: '',
}));

export const useFormAction = formAction$<SignupForm>(async (values, event) => {
    // Runs on server
    console.log("Works", values);

    const hashedPassword = await new Argon2id().hash(values.password);

    try {
        const [insertedUser] = await db.insert(users).values({
            email: values.email,
            hashedPassword: hashedPassword,
        }).returning({ id: users.id });

        const session = await lucia.createSession(insertedUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });
    } catch (e) {
        // @ts-ignore
        if (e.code === "23505") {
            return event.fail(400, {
                message: "Email already used",
                form
            });
        }
        return event.fail(500, {
            message: "An unknown error occurred",
            form
        });
    }

    event.redirect(302, "/");
}, valiForm$(LoginSchema));

export default component$(() => {
    const [signupForm, { Form, Field }] = useForm<SignupForm>({
        loader: useFormLoader(),
        action: useFormAction(),
        validate: valiForm$(SignupForm),
    });

    const handleSubmit: QRL<SubmitHandler<SignupForm>> = $((values) => {
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