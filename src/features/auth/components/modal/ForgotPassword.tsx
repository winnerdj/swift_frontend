import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { Dialog, DialogPanel } from '@/components/Dialog';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import { Button } from '@/components/ui/button';
import * as yup from 'yup';
import { useForgotPasswordMutation } from '@/lib/redux/api/auth.api';

interface ForgotPasswordProps {
    onClose: () => void;
    isOpen: boolean;
}

/** Yup schema for forgot password form */
const forgotPasswordSchema = yup.object({
    user_email: yup.string().required('Email address is required'),
});

type ForgotPasswordType = yup.InferType<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ isOpen, onClose }) => {
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation(); 

    const form = useForm<ForgotPasswordType>({
        resolver: yupResolver(forgotPasswordSchema),
        defaultValues: {
            user_email: '',
        }
    });

    const handleSubmit = async (data: ForgotPasswordType) => {
        try {
            console.log("Submitting forgot password request for:", data.user_email);

            const response = await forgotPassword({ user_email: data.user_email }).unwrap();

            if(response.success) {
                toast.success("Password reset has been sent to your email.");
                form.reset();
                onClose();
            }
            else {
                toast.error(response.message || "Failed to initiate password reset. Please try again.");
            }
        } catch (error) {
            console.error("Error during forgot password request:", error);
            toast.error("An error occurred during the password reset request. Please check your email address and try again.");
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-md w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Forgot Password</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-4'>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Provide email address to reset password.
                                    </p>
                                    <FormField
                                        control={form.control}
                                        name='user_email'
                                        render={({ field }) => (
                                            <FormInput
                                                {...field}
                                                label='Email Address'
                                                placeholder='Enter your email address'
                                                type='text'
                                                autoComplete="email address"
                                            />
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button type='submit' isLoading={isLoading} disabled={isLoading}>Send Reset Password</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default ForgotPassword;