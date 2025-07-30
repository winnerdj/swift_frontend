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
import { useAppSelector, useAppDispatch } from "@/hooks/redux.hooks";
import { getUserDetails, setLogOut } from "@/lib/redux/slices/auth.slice";
import { useUpdatePasswordMutation } from '@/lib/redux/api/auth.api';


interface UpdatePasswordProps {
    onClose: () => void;
    isOpen: boolean;
}

/** Regex for password complexity checks */
const hasUppercase = /[A-Z]/;
const hasLowercase = /[a-z]/;
const hasNumber = /[0-9]/;
const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

/** Function to evaluate password strength */
const getPasswordStrength = (password: string) => {
    let score = 0;
    const requirementsMet = {
        length: password.length,
        uppercase: hasUppercase.test(password),
        lowercase: hasLowercase.test(password),
        number: hasNumber.test(password),
        specialChar: hasSpecialChar.test(password),
        /** For strong password, check for multiple numbers and special chars */
        multipleNumbers: (password.match(/[0-9]/g) || []).length >= 2,
        multipleSpecialChars: (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g) || []).length >= 2,
    };

    /** Score based on criteria */
    if(requirementsMet.length >= 8) score++;
    if(requirementsMet.uppercase) score++;
    if(requirementsMet.lowercase) score++;
    if(requirementsMet.number) score++;
    if(requirementsMet.specialChar) score++;

    /** Determine strength level */
    if(password.length < 8 || score < 4) { /**  Less than 8 chars or missing any of the 4 basic types */
        return { level: 'Weak', requirements: requirementsMet };
    }
    else if(password.length >= 8 && score >= 4) { /** At least 8 chars and all 4 basic types */
        /** Check for strong criteria */
        if(password.length >= 12 && requirementsMet.lowercase && requirementsMet.multipleNumbers && requirementsMet.multipleSpecialChars) {
            return { level: 'Strong', requirements: requirementsMet };
        }
        return { level: 'Moderate', requirements: requirementsMet };
    }
    return { level: 'Weak', requirements: requirementsMet };
};

/** Yup schema for password update form */
const updatePasswordSchema = yup.object({
    current_password: yup.string().required('Current password is required'),
    new_password: yup.string()
        .required('New password is required')
        .test('password-strength', 'Password is too weak. Must be at least Moderate strength.', (value) => {
            if(!value) return false; /** If no value, let the 'required' rule handle it */
            const { level } = getPasswordStrength(value);
            return level === 'Moderate' || level === 'Strong';
        }),
    confirm_new_password: yup.string()
        .required('Confirm new password is required')
        .oneOf([yup.ref('new_password')], 'Passwords must match'),
});

type UpdatePasswordType = yup.InferType<typeof updatePasswordSchema>;

const UpdatePassword: React.FC<UpdatePasswordProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();

    const handleSignOut = () => { dispatch(setLogOut()) }
    const userSessionDetails = useAppSelector(getUserDetails);

    /** Mock mutation hook for demonstration. Replace with your actual RTK Query hook. */
    const [updatePassword, updatePasswordProps] = useUpdatePasswordMutation();

    const form = useForm<UpdatePasswordType>({
        resolver: yupResolver(updatePasswordSchema),
        defaultValues: {
            current_password: '',
            new_password: '',
            confirm_new_password: '',
        }
    });

    const newPasswordValue = form.watch('new_password');
    const { level: passwordStrengthLevel, requirements: passwordRequirements } = getPasswordStrength(newPasswordValue);

    const handleSubmit = async(data: UpdatePasswordType) => {
        try {
            console.log("Submitting password update:", data);

            let response = await updatePassword({
                user_id: userSessionDetails?.user_name,
                current_password: data.current_password,
                new_password: data.new_password
            })

            if('data' in response && response.data?.updatedRow > 0) {
                toast.success("Password updated successfully.");
                form.reset();
                onClose();
                handleSignOut();
            }
            else if('error' in response) {
                toast.error("Failed to update password.");
            }
            else {
                toast.error("No user has been updated.");
            }
        }
        catch (error) {
            console.error("Error updating password:", error);
            toast.error("An unexpected error occurred.");
        }
    };

    /** Helper to render requirement status */
    const RequirementStatus = ({ met, text }: { met: boolean; text: string }) => (
        <span className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-red-500'}`}>
            {met ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
            ) : (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
            )}
            {text}
        </span>
    );

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-md w-full"> {/* Smaller dialog for password update */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Password</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-4'> {/* Single column layout for password fields */}
                                    <FormField
                                        control={form.control}
                                        name='current_password'
                                        render={({ field }) => (
                                            <FormInput
                                                {...field}
                                                label='Current Password'
                                                placeholder='Enter current password'
                                                type='password'
                                                autoComplete="current-password"
                                            />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='new_password'
                                        render={({ field }) => (
                                            <div>
                                                <FormInput
                                                    {...field}
                                                    label='New Password'
                                                    placeholder='Enter new password'
                                                    type='password'
                                                    autoComplete="new-password"
                                                />
                                                {/* Password Strength Feedback */}
                                                {newPasswordValue && (
                                                    <div className="mt-2 text-sm">
                                                        <p className={`font-semibold ${passwordStrengthLevel === 'Weak' ? 'text-red-500' : passwordStrengthLevel === 'Moderate' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                            Strength: {passwordStrengthLevel}
                                                        </p>
                                                        <div className="mt-1 space-y-1">
                                                            <p className="font-bold">Requirements:</p>
                                                            <RequirementStatus met={passwordRequirements.length >= 8} text="At least 8 characters" />
                                                            <RequirementStatus met={passwordRequirements.uppercase} text="At least one uppercase letter" />
                                                            <RequirementStatus met={passwordRequirements.lowercase} text="At least one lowercase letter" />
                                                            <RequirementStatus met={passwordRequirements.number} text="At least one numeric digit" />
                                                            <RequirementStatus met={passwordRequirements.specialChar} text="At least one special character (!@#$...)" />
                                                            {/* Strong password specific requirements */}
                                                            {passwordStrengthLevel === 'Strong' && (
                                                                <>
                                                                    <RequirementStatus met={passwordRequirements.length >= 12} text="At least 12 characters" />
                                                                    <RequirementStatus met={passwordRequirements.multipleNumbers} text="Multiple numeric digits" />
                                                                    <RequirementStatus met={passwordRequirements.multipleSpecialChars} text="Multiple special characters" />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='confirm_new_password'
                                        render={({ field }) => (
                                            <FormInput
                                                {...field}
                                                label='Confirm New Password'
                                                placeholder='Confirm new password'
                                                type='password'
                                                autoComplete="new-password"
                                            />
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={updatePasswordProps.isLoading} disabled={updatePasswordProps.isLoading}>Save Password</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default UpdatePassword;