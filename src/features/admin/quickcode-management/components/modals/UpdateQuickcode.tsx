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
import { useUpdateQuickcodeMutation } from '@/lib/redux/api/quickcode.api';
import { quickcodeTableType } from '../../types';
import * as yup from 'yup';

interface UpdateQuickcodeProps {
    onClose: () => void;
    isOpen: boolean;
    selectedQuickcode: quickcodeTableType | null;
}

const updateQuickcodeSchema = yup.object({
    qc_type: yup.string().required('Quickcode type is required'),
    qc_code: yup.string().required('Quickcode is required'),
    qc_status: yup.boolean().required('Quickcode is required'),
    qc_description: yup.string().required('Quickcode description is required'),
    qc_alternative_code1: yup.string().nullable(),
    qc_alternative_code2: yup.string().nullable(),
    qc_alternative_code3: yup.string().nullable(),
    qc_remarks1: yup.string().nullable(),
    qc_remarks2: yup.string().nullable(),
    qc_remarks3: yup.string().nullable(),
});

type UpdateQuickcodeType = yup.InferType<typeof updateQuickcodeSchema>;

const UpdateQuickcode: React.FC<UpdateQuickcodeProps> = ({ isOpen, onClose, selectedQuickcode }) => {
    const [updateQuickcode, updateQuickcodeProps] = useUpdateQuickcodeMutation();

    const form = useForm<UpdateQuickcodeType>({
        resolver: yupResolver(updateQuickcodeSchema),
        defaultValues: {
            qc_type: '',
            qc_code: '',
            qc_status: false,
            qc_description: '',
            qc_alternative_code1: '',
            qc_alternative_code2: '',
            qc_alternative_code3: '',
            qc_remarks1: '',
            qc_remarks2: '',
            qc_remarks3: ''
        }
    });

    /** Effect to update form values when selectedQuickcode changes */
    React.useEffect(() => {
        if(selectedQuickcode) {
            form.reset({
                qc_type: selectedQuickcode.qc_type || '',
                qc_code: selectedQuickcode.qc_code || '',
                qc_status: selectedQuickcode.qc_status || true,
                qc_description: selectedQuickcode.qc_description || '',
                qc_alternative_code1: selectedQuickcode.qc_alternative_code1 || '',
                qc_alternative_code2: selectedQuickcode.qc_alternative_code2 || '',
                qc_alternative_code3: selectedQuickcode.qc_alternative_code3 || '',
                qc_remarks1: selectedQuickcode.qc_remarks1 || '',
                qc_remarks2: selectedQuickcode.qc_remarks2 || '',
                qc_remarks3: selectedQuickcode.qc_remarks3 || ''
            })
        }
    }, [selectedQuickcode, form])

    const handleSubmit = async (data: UpdateQuickcodeType) => {
        console.log("Submitting selectedQuickcode", data); // Debugging

        await updateQuickcode({
            qc_type: data.qc_type ?? '',
            qc_code: data.qc_code ?? '',
            qc_status: data.qc_status ?? false,
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
                onClose();
            }
        })
        .catch(error => {
            console.error("Error updating quickcode:", error);
            toast.error("Failed to update quickcode");
        })
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Quickcode</CardTitle>
                            </CardHeader>
                            <CardContent>

                                <div className='grid grid-cols-3 gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='qc_type'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode type' placeholder='Enter code type' autoComplete="off" spellCheck={false} autoCorrect="off" readOnly disabled/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_code'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode code' placeholder='Enter code' autoComplete="off" spellCheck={false} autoCorrect="off" readOnly disabled/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_status'
                                        render={({ field }) => (
                                            <div className='flex items-center gap-3'>
                                                <label className='font-bold text-sm'>Status
                                                <Switch name='qc_status'
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => form.setValue('qc_status', checked, { shouldValidate: true })}
                                                />
                                                </label>
                                                <span>{field.value ? 'Active' : 'Inactive'}</span>
                                            </div>
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
                                            <FormInput {...field} label='Quickcode alternative code1' placeholder='Enter alternative code1' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_alternative_code2'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode alternative code2' placeholder='Enter alternative code2' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_alternative_code3'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Quickcode alternative code3' placeholder='Enter alternative code3' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_remarks1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks1' placeholder='Enter remarks1' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_remarks2'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks2' placeholder='Enter remarks2' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='qc_remarks3'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks3' placeholder='Enter remarks3' value={field.value ?? ''} autoComplete="off" spellCheck="false" autoCorrect="off"/>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={updateQuickcodeProps.isLoading}>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default UpdateQuickcode;