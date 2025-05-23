import React from "react";
import { Navigate } from "react-router-dom";
import AuthForm from "../components/form/AuthForm";

import { getAccessToken } from "@/lib/redux/slices/auth.slice";
import { useAppSelector } from "@/hooks/redux.hooks";


const Auth: React.FC = () => {
    const token = useAppSelector(getAccessToken);

    if(token) return <Navigate to="/" replace />;

    return (
        <div className="h-screen flex flex-col md:grid md:grid-cols-2 bg-gray-100 min-w-[320px]">
            {/* Left Section - Hidden on Mobile */}
            <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-orange-300 via-gray-200 to-gray-600"
            >
                <h1 className="text-5xl font-bold text-gray-800 drop-shadow-lg">
                    Welcome Back
                </h1>
            </div>

            {/* Right Section - Auth Form (Now perfectly centered) */}
            <div className="flex justify-center items-center w-full h-full">
                <div className="bg-white border border-gray-300 p-8 rounded-2xl shadow-lg w-full max-w-sm">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                        Sign In
                    </h2>
                    <AuthForm />
                </div>
            </div>
        </div>
    );
};

export default Auth;