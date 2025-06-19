import React from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch } from "@/hooks/redux.hooks";
import { useLoginMutation } from "@/lib/redux/api/auth.api";
import { setLogin } from "@/lib/redux/slices/auth.slice";

const authSchema = yup.object({
    user_id: yup.string().required("Username is required"),
    user_password: yup.string().required("Password is required"),
});

type AuthSchemaType = yup.InferType<typeof authSchema>;

const AuthForm: React.FC = () => {
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();

    const form = useForm<AuthSchemaType>({
        resolver: yupResolver(authSchema),
        defaultValues: {
            user_id: "",
            user_password: "",
        },
    });

    const handleSubmit = async (values: AuthSchemaType) => {
        try {
            const result = await login(values).unwrap();

            dispatch(
                setLogin({
                    user_id: result?.user_id,
                    token: {
                        app_key: result.token?.app_key,
                        expiry: result.token?.expiry,
                        "x-access-token": result?.token?.["x-access-token"]
                    },
                    userDetails: {
                        user_role: result?.userDetails?.user_role,
                        user_email: result?.userDetails?.user_email,
                        user_location: result?.userDetails?.user_location,
                        user_name: result?.userDetails?.user_name,
                    },
                })
            );
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="user_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Username</FormLabel>
                            <FormControl>
                                <Input
                                    className="bg-white border px-4 border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your username"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="user_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    className="bg-white border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                    )}
                />
                <Button
                    isLoading={isLoading}
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 transition-all text-white font-medium py-2 rounded-lg"
                >
                    Sign In
                </Button>
            </form>
        </Form>
    );
};

export default AuthForm;