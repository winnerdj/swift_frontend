import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import React from 'react'
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useCreateRoleMutation } from '@/lib/redux/api/role.api';
import { toast } from 'react-toastify';

interface CreateRoleProps {
    onClose: () => void;
    isOpen: boolean;
}

const createRoleSchema = yup.object({
    role_name: yup.string().required('Role name is required'),
    role_description: yup.string().required('Role description is required'),
    role_remarks1: yup.string(),
    role_remarks2: yup.string(),
    role_remarks3: yup.string(),
});

type CreateRoleType = yup.InferType<typeof createRoleSchema>;


const CreateRole: React.FC<CreateRoleProps> = (props) => {
    const [createRole, createRoleProps] = useCreateRoleMutation();

    const form = useForm<CreateRoleType>({
        resolver: yupResolver(createRoleSchema),
        defaultValues: {
            role_name: '',
            role_description: '',
            role_remarks1: '',
            role_remarks2: '',
            role_remarks3: '',
        }
    });

    const handleSubmit = async (data: CreateRoleType) => {
        console.log("Submitting data:", data); // Debugging

        await createRole({
            role_name: data.role_name ?? '',
            role_description: data.role_description ?? '',
            role_remarks1: data.role_remarks1 ?? '',
            role_remarks2: data.role_remarks2 ?? '',
            role_remarks3: data.role_remarks3 ?? ''
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
                form.reset();
                props.onClose();
            }
        })
        .catch(error => {
            console.error("Error creating role:", error);
            toast.error("Failed to create role");
        });
    };

    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(
                            (data) => {
                                handleSubmit(data);
                            }, (errors) => console.log("Form validation errors:", errors)
                        )}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Role</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-3 gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='role_name'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Role name' placeholder='Enter name' autoCapitalize='on' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_description'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Role description' placeholder='Enter description'autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_remarks1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks1' placeholder='Enter remarks1' autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_remarks2'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks2' placeholder='Enter remarks2' autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='role_remarks3'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks3' placeholder='Enter remarks3' autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={props.onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={createRoleProps.isLoading}>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default CreateRole