import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { Dialog, DialogPanel } from '@/components/Dialog';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import { Button } from '@/components/ui/button';
import APISelect from '@/components/select/APISelect';
import { Switch } from '@/components/ui/switch';
// import FormAppLabel from '@/components/form/FormLabel';
// import FormAPISelect from '@/components/form/FormAPISelect';
// import { UserContext } from '../context/UserContext';
import { useUpdateUserMutation } from '@/lib/redux/api/user.api';
import { userTableType } from '../../types';
import * as yup from 'yup';

interface UpdateUserProps {
    onClose: () => void;
    isOpen: boolean;
    selectedUser: userTableType | null;
}

const updateUserSchema = yup.object({
    // user_id: yup.string().required('User ID is required'),
    user_role: yup.string().required('Role is required'),
    // user_password: yup.string().required('Password is required'),
    user_status: yup.boolean().required('Status is required'),
    user_name: yup.string().required('Username is required'),
    user_location: yup.string().required('Location is required'),
    user_email: yup.string().email('Invalid email').required('Email is required'),
    user_first_name: yup.string().required('First name is required'),
    user_middle_name: yup.string().nullable(),
    user_last_name: yup.string().required('Last name is required'),
    user_contact_person: yup.string().nullable(),
    user_contact_no: yup.string().required('Contact number is required'),
    user_address: yup.string().nullable(),
});

type UpdateUserType = yup.InferType<typeof updateUserSchema>;


const UpdateUser: React.FC<UpdateUserProps> = ({ isOpen, onClose, selectedUser }) => {
    const [updateUser, updateUserProps] = useUpdateUserMutation();
    const [role, setRole] = React.useState<{ label: string; value: string } | null>(null);
    const [userLocation, setUserLocation] = React.useState<{label: string; value:string} | null> (null)

    const form = useForm<UpdateUserType>({
        resolver: yupResolver(updateUserSchema),
        defaultValues: {
            user_name: '',
            user_role: '',
            user_status: false,
            user_location: '',
            user_email: '',
            user_first_name: '',
            user_middle_name: null,
            user_last_name: '',
            user_contact_person: '',
            user_contact_no: '',
            user_address: '',
        }
    });

    // Effect to update form values when selectedUser changes
    React.useEffect(() => {
        if(selectedUser) {
            form.reset({
                user_name: selectedUser.user_name || '',
                user_role: selectedUser.user_role || '',
                user_status: selectedUser.user_status ?? true,
                user_location: selectedUser.user_location || '',
                user_email: selectedUser.user_email || '',
                user_first_name: selectedUser.user_first_name || '',
                user_middle_name: selectedUser.user_middle_name || '',
                user_last_name: selectedUser.user_last_name || '',
                user_contact_person: selectedUser.user_contact_person || '',
                user_contact_no: selectedUser.user_contact_no || '',
                user_address: selectedUser.user_address || '',
            });

            setRole(selectedUser.user_role ? { label: selectedUser.user_role, value: selectedUser.user_role } : null);
        }
    }, [selectedUser, form]);

    const handleSubmit = async (data: UpdateUserType) => {
        console.log("Submitting data:", data); // Debugging

        if(!role?.value) {
            toast.error("User role is required");
            return;
        }

        await updateUser({
            user_name: data.user_name ?? '',
            user_role: role?.value ?? '',
            user_status: data.user_status,
            user_email: data.user_email ?? '',
            user_location: data.user_location ?? '',
            user_first_name: data.user_first_name,
            user_middle_name: data.user_middle_name ?? '',
            user_last_name: data.user_last_name,
            user_contact_person: data.user_contact_person ?? '',
            user_contact_no: data.user_contact_no,
            user_address: data.user_address ?? ''
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
                form.reset();
                setRole(null);
                onClose();
            }
        })
        .catch(error => {
            console.error("Error updating user:", error);
            // toast.error("Failed to update user");
        });
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Update User</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-3 gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='user_name'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Username' placeholder='Enter username' autoCapitalize='on' autoComplete="off" spellCheck={false} autoCorrect="off" readOnly disabled/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_status'
                                        render={({ field }) => (
                                            <div className='flex items-center gap-3'>
                                                <label className='font-bold text-sm'>Status
                                                <Switch name='user_status'
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => form.setValue('user_status', checked, { shouldValidate: true })}
                                                />
                                                </label>
                                                <span>{field.value ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_role'
                                        render={() => (
                                            <div className='space-y-2 flex flex-col gap-0'>
                                                <label className='font-bold font-sans text-sm leading-none mr-0 ml-0'>Role
                                                    <APISelect
                                                        id='user_role'
                                                        type={'role'}
                                                        onChange={(selected) => {
                                                            form.setValue('user_role', selected?.value || '', { shouldValidate: true })
                                                            setRole(selected)
                                                        }}
                                                        value={role}
                                                        placeholder='Select Role'
                                                        className='text-sm'
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_location'
                                        render={() => (
                                            <div className='space-y-2 flex flex-col gap-0'>
                                                <label className='font-bold font-sans text-sm leading-none mr-0 ml-0'>Location</label>
                                                <APISelect
                                                    id='user_location'
                                                    type={'quickcode'}
                                                    qc_type={'location'}
                                                    onChange={(selected) => {
                                                        form.setValue('user_location', selected?.value || '', { shouldValidate: true })
                                                        setUserLocation(selected)
                                                    }}
                                                    value={userLocation}
                                                    placeholder='Select location'
                                                    className='text-sm'
                                                />
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_email'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Email' placeholder='Enter email' type='email' autoComplete="off" spellCheck="false" autoCorrect="off" readOnly disabled/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_first_name'
                                        render={({ field }) => (
                                            <FormInput {...field} label='First Name' placeholder='Enter first name' autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_middle_name'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Middle Name' placeholder='Enter middle name' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_last_name'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Last Name' placeholder='Enter last name' autoComplete="off" spellCheck="false" autoCorrect="off" />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_contact_no'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Contact No' placeholder='Enter contact number' autoComplete="off" spellCheck="false" autoCorrect="off" />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_contact_person'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Contact Person' placeholder='Enter contact person' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='user_address'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Address' placeholder='Enter address' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={updateUserProps.isLoading}>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default UpdateUser;
