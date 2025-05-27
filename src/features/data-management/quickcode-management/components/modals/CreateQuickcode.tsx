import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import React from 'react'
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useCreateQuickcodeMutation } from '@/lib/redux/api/quickcode.api';
import { toast } from 'react-toastify';

interface CreateQuickcodeProps {
    onClose: () => void;
    isOpen: boolean;
}

const createQuickcodeSchema = yup.object({
    qc_type: yup.string().required('Quickcode type is required'),
    qc_code: yup.string().required('Quickcode is required'),
    qc_description: yup.string().required('Quickcode description is required'),
    qc_alternative_code1: yup.string(),
    qc_alternative_code2: yup.string(),
    qc_alternative_code3: yup.string(),
    qc_remarks1: yup.string(),
    qc_remarks2: yup.string(),
    qc_remarks3: yup.string(),
});

type CreateQuickcodeType = yup.InferType<typeof createQuickcodeSchema>;


const CreateQuickcode: React.FC<CreateQuickcodeProps> = (props) => {
    const [createQuickcode, createQuickcodeProps] = useCreateQuickcodeMutation();

    const form = useForm<CreateQuickcodeType>({
        resolver: yupResolver(createQuickcodeSchema),
        defaultValues: {
            qc_type: '',
            qc_code: '',
            qc_description: '',
            qc_alternative_code1: '',
            qc_alternative_code2: '',
            qc_alternative_code3: '',
            qc_remarks1: '',
            qc_remarks2: '',
            qc_remarks3: ''
        }
    });

    const handleSubmit = async (data: CreateQuickcodeType) => {
        console.log("Submitting data:", data); // Debugging

        await createQuickcode({
            qc_type: data.qc_type ?? '',
            qc_code: data.qc_code ?? '',
            qc_description: data.qc_description ?? '',
            qc_alternative_code1: data.qc_alternative_code1 ?? '',
            qc_alternative_code2: data.qc_alternative_code2 ?? '',
            qc_alternative_code3: data.qc_alternative_code3 ?? '',
            qc_remarks1: data.qc_remarks1 ?? '',
            qc_remarks2: data.qc_remarks2 ?? '',
            qc_remarks3: data.qc_remarks3 ?? ''
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
            console.error("Error creating quickcode:", error);
            toast.error("Failed to create quickcode");
        });
    };

    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(
                            (data) => {
                                console.log("Form submitted successfully:", data);
                                handleSubmit(data);
                            }, (errors) => console.log("Form validation errors:", errors)
                        )}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Quickcode</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-3 gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='qc_type'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode type' placeholder='Enter code type' autoCapitalize='on' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_code'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode code' placeholder='Enter code' autoCapitalize='on' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_description'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode description' placeholder='Enter description'autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_alternative_code1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode alternative code1' placeholder='Enter alternative code1'autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_alternative_code2'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode alternative code2' placeholder='Enter alternative code2'autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_alternative_code3'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode alternative code3' placeholder='Enter alternative code3'autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_remarks1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks1' placeholder='Enter remarks1' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_remarks2'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks2' placeholder='Enter remarks2' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_remarks3'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks3' placeholder='Enter remarks3' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={props.onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={createQuickcodeProps.isLoading}>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    )
}

export default CreateQuickcode