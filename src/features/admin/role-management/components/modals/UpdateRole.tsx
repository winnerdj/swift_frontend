import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { Dialog, DialogPanel } from '@/components/Dialog';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUpdateRoleMutation } from '@/lib/redux/api/role.api';
import { roleTableType } from '../../types';
import * as yup from 'yup';

interface UpdateRoleProps {
    onClose: () => void;
    isOpen: boolean;
    selectedRole: roleTableType | null;
}

const updateRoleSchema = yup.object({
    // role_id: yup.string().required('Role ID is required'),
    role_name: yup.string().required('Role is required'),
    role_status: yup.boolean().required('Status is required'),
    role_description: yup.string().nullable(),
    role_remarks1: yup.string().nullable(),
    role_remarks2: yup.string().nullable(),
    role_remarks3: yup.string().nullable(),
});

type UpdateRoleType = yup.InferType<typeof updateRoleSchema>;

const UpdateRole: React.FC<UpdateRoleProps> = ({ isOpen, onClose, selectedRole }) => {
    const [updateRole, updateRoleProps] = useUpdateRoleMutation();
    const form = useForm<UpdateRoleType>({
        resolver: yupResolver(updateRoleSchema),
        defaultValues: {
            role_name: '',
            role_status: false,
            role_description: '',
            role_remarks1: '',
            role_remarks2: '',
            role_remarks3: ''
        }
    });

    // Effect to update form values when selectedRole changes
    React.useEffect(() => {
        if(selectedRole) {
            form.reset({
                role_name: selectedRole.role_name || '',
                role_status: selectedRole.role_status ?? true,
                role_description: selectedRole.role_description || '',
                role_remarks1: selectedRole.role_remarks1 || '',
                role_remarks2: selectedRole.role_remarks2 || '',
                role_remarks3: selectedRole.role_remarks3 || ''
            });
        }
    }, [selectedRole, form]);

    const handleSubmit = async (data: UpdateRoleType) => {
        console.log("Submitting data:", data); // Debugging

        await updateRole({
            role_name: data.role_name ?? '',
            role_status: data.role_status,
            role_description: data.role_description ?? '',
            role_remarks1: data.role_remarks1 ?? '',
            role_remarks2: data.role_remarks2 ?? '',
            role_remarks3: data.role_remarks3 ?? '',
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
                form.reset();
                onClose();
            }
        })
        .catch(error => {
            console.error("Error updating role:", error);
            // toast.error("Failed to update role");
        });
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Role</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-3 gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='role_name'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Role Name' placeholder='Enter rolename' autoComplete="off" spellCheck={false} autoCorrect="off" readOnly disabled/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_description'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Role Description' placeholder='Enter description' value={field.value ?? ''} autoCapitalize='on' autoComplete="off" spellCheck={false} autoCorrect="off" />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_status'
                                        render={({ field }) => (
                                            <div className='flex items-center gap-3'>
                                                <label className='font-bold text-sm'>Status
                                                <Switch name='role_status'
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => form.setValue('role_status', checked, { shouldValidate: true })}
                                                />
                                                </label>
                                                <span>{field.value ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_remarks1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks1' placeholder='Remarks1' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_remarks2'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks2' placeholder='Remarks2' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off" />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_remarks3'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks3' placeholder='Remarks3' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off" />
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={updateRoleProps.isLoading}>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default UpdateRole;
