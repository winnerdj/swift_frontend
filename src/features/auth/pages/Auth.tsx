import React from "react";
import { Navigate } from "react-router-dom";
import AuthForm from "../components/form/AuthForm";

import { getAccessToken } from "@/lib/redux/slices/auth.slice";
import { useAppSelector } from "@/hooks/redux.hooks";
import logoUrl from '../../../assets/K-logistikus_png.png'

const Auth: React.FC = () => {
    const token = useAppSelector(getAccessToken);

    // If a token exists, navigate to the home page
    if(token) return <Navigate to="/" replace />;

    // Placeholder URL for your PNG logo.
    // Replace this with the actual path to your logo file (e.g., '/path/to/your/logo.png')
    // or a public URL if hosted externally.

    return (
        // Main container: full screen height, responsive grid layout, with a white background
        <div className="h-screen flex flex-col md:grid md:grid-cols-2 bg-white min-w-[320px]">

            {/* Left Section: Displays the logo, hidden on small screens (mobile) */}
            <div className="hidden md:flex items-center justify-center bg-white">
                {/* Image tag for the logo, with responsive sizing */}
                <img
                    src={logoUrl}
                    alt="Company Logo"
                    className="max-w-2xl w-full h-auto" // Added rounded corners and shadow for better appearance
                />
            </div>

            {/* Right Section: Contains the authentication form, centered both horizontally and vertically */}
            <div className="flex justify-center items-center w-full h-full bg-gray-600">
                {/* Card-like container for the login form, with a light gray background */}
                <div className="bg-gray-100 border border-gray-300 p-8 rounded-2xl shadow-lg w-full max-w-sm">
                    {/* Sign In title for the form */}
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                        Sign In
                    </h2>
                    {/* The actual authentication form component */}
                    <AuthForm />
                </div>
            </div>
        </div>
    );
};

export default Auth;