import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import { Switch } from '@/components/ui/switch';
import React from 'react'
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useCreateServiceMutation } from '@/lib/redux/api/service.api';
import { toast } from 'react-toastify';
import APISelect from '@/components/select/APISelect';

interface CreateServiceProps {
    onClose: () => void;
    isOpen: boolean;
}

const createServiceSchema = yup.object({
    // service_id : yup.string().required('Service ID is required'),
    service_name : yup.string().required('Service name is required'),
    service_location : yup.string().required('Service location is required'),
    // service_status : yup.boolean().required('Service status is required'),
    service_description : yup.string().required('Service description is required'),
    service_discipline : yup.string().required('Service disciplin is required'),
    no_of_counters : yup.number(),
    counter_prefix : yup.string().required('Counter prefix is required'),
    ticket_number_prefix : yup.string().required('Ticket number prefix is required'),
    recall_waiting_flag : yup.boolean(),
    recall_waiting_time : yup.number().nullable(),
    service_remarks1 : yup.string().nullable(),
    service_remarks2 : yup.string().nullable(),
    service_remarks3 : yup.string().nullable(),
});

type CreateServiceType = yup.InferType<typeof createServiceSchema>;


const CreateService: React.FC<CreateServiceProps> = (props) => {
    const [createService, createServiceProps] = useCreateServiceMutation();
    const [serviceLoc, setServiceLoc] = React.useState<{label: string; value:string} | null> (null)
    const [serviceDiscipline, setServiceDiscipline] = React.useState<{label: string; value:string} | null> (null)

    const form = useForm<CreateServiceType>({
        resolver: yupResolver(createServiceSchema),
        defaultValues: {
            // service_id : '',
            service_name : '',
            service_location : '',
            // service_status : false,
            service_description : '',
            service_discipline : '',
            no_of_counters : 0,
            counter_prefix : '',
            ticket_number_prefix : '',
            recall_waiting_flag : false,
            recall_waiting_time : 0,
            service_remarks1 : '',
            service_remarks2 : '',
            service_remarks3 : '',
        }
    });

    const handleSubmit = async (data: CreateServiceType) => {
        console.log("Submitting data:", data); // Debugging

        await createService({
            // service_id : data.service_id ?? '',
            service_name : data.service_name ?? '',
            service_location : data.service_location ?? '',
            // service_status : data.service_status ?? false,
            service_description : data.service_description ?? '',
            service_discipline : data.service_discipline ?? '',
            no_of_counters : data.no_of_counters ?? 0,
            counter_prefix : data.counter_prefix ?? '',
            ticket_number_prefix : data.ticket_number_prefix ?? '',
            recall_waiting_flag : data.recall_waiting_flag ?? false,
            recall_waiting_time : data.recall_waiting_time ?? 0,
            service_remarks1 : data.service_remarks1 ?? '',
            service_remarks2 : data.service_remarks2 ?? '',
            service_remarks3 : data.service_remarks3 ?? '',
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
                form.reset();
                setServiceLoc(null);
                setServiceDiscipline(null);
                props.onClose();
            }
        })
        .catch(error => {
            console.error("Error creating service:", error);
            toast.error("Failed to create service");
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
                                <CardTitle>Create Service</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-3 gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='service_name'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Service name' placeholder='Enter service name' autoCapitalize='on' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='service_location'
                                        render={() => (
                                            <div className='space-y-2 flex flex-col gap-0'>
                                                <label className='font-bold font-sans text-sm leading-none mr-0 ml-0'>Location</label>
                                                <APISelect
                                                    id='service_location'
                                                    type={'quickcode'}
                                                    qc_type={'location'}
                                                    onChange={(selected) => {
                                                        form.setValue('service_location', selected?.value || '', { shouldValidate: true })
                                                        setServiceLoc(selected)
                                                    }}
                                                    value={serviceLoc}
                                                    placeholder='Select location'
                                                    className='text-sm'
                                                />
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='service_description'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Description' placeholder='Enter description'autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='service_discipline'
                                        render={() => (
                                            <div className='space-y-2 flex flex-col gap-0'>
                                                <label className='font-bold font-sans text-sm leading-none mr-0 ml-0'>Discipline</label>
                                                <APISelect
                                                    id='service_discipline'
                                                    type={'quickcode'}
                                                    qc_type={'discipline'}
                                                    onChange={(selected) => {
                                                        form.setValue('service_discipline', selected?.value || '', { shouldValidate: true })
                                                        setServiceDiscipline(selected)
                                                    }}
                                                    value={serviceDiscipline}
                                                    placeholder='Select discipline'
                                                    className='text-sm'
                                                />
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='no_of_counters'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Number of Counters' type='number' placeholder='Enter number of counters' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='counter_prefix'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Counter Prefix' placeholder='Enter counter prefix' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='ticket_number_prefix'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Ticket Number Prefix' placeholder='Enter ticket number prefix' autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='recall_waiting_flag'
                                        render={({ field }) => (
                                            <div className='flex items-center gap-3'>
                                                <label className='font-bold text-sm'>Recall waiting flag</label>
                                                <Switch name='recall_waiting_flag'
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => form.setValue('recall_waiting_flag', checked, { shouldValidate: true })}
                                                />
                                                <span>{field.value ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='recall_waiting_time'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Recall Waiting time' placeholder='Enter recall waiting time' type='number' value={field?.value ?? 0}  autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='service_remarks1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks1' placeholder='Enter remarks1' value={field?.value ?? ''} autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='service_remarks2'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks2' placeholder='Enter remarks2' value={field?.value ?? ''} autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='service_remarks3'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Remarks3' placeholder='Enter remarks3' value={field?.value ?? ''} autoComplete="off" spellCheck={false} autoCorrect="off"/>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={props.onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={createServiceProps.isLoading}>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    )
}

export default CreateService