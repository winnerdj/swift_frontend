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
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/lib/redux/api/auth.api";
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hooks";
import { getAccessToken, setLogin } from "@/lib/redux/slices/auth.slice";
import { Navigate } from "react-router-dom";

const authSchema = yup.object({
    user_id: yup.string().required("Username is required"),
    user_password: yup.string().required("Password is required"),
});

type AuthSchemaType = yup.InferType<typeof authSchema>;

const AuthForm: React.FC = () => {
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const token = useAppSelector(getAccessToken);

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
                    user_id: result.user_id,
                    token: result.token,
                    role_name: result.role.role_name,
                    role_id: result.role.role_id,
                })
            );
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    if (token) return <Navigate to="/" replace />;

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
                                className="bg-"
                                    // className="bg-white border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
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
