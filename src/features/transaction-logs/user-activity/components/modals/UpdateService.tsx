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
import { useUpdateServiceMutation } from '@/lib/redux/api/service.api';
import { userActivityTableType } from '../../types';
import * as yup from 'yup';
import APISelect from '@/components/select/APISelect';

interface UpdateServiceProps {
    onClose: () => void;
    isOpen: boolean;
    selectedService: userActivityTableType | null;
}

const updateServiceSchema = yup.object({
    service_id : yup.string().required('Service ID is required'),
    service_name : yup.string().required('Service name is required'),
    service_location : yup.string().required('Service location is required'),
    service_status : yup.boolean().required('Service status is required'),
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

type UpdateServiceType = yup.InferType<typeof updateServiceSchema>;

const UpdateService: React.FC<UpdateServiceProps> = ({ isOpen, onClose, selectedService }) => {
    const [updateService, updateServiceProps] = useUpdateServiceMutation();
    const [serviceLoc, setServiceLoc] = React.useState<{label: string; value:string} | null> (null)
    const [serviceDiscipline, setServiceDiscipline] = React.useState<{label: string; value:string} | null> (null)

    const form = useForm<UpdateServiceType>({
        resolver: yupResolver(updateServiceSchema),
        defaultValues: {
            service_id : '',
            service_name : '',
            service_location : '',
            service_status : false,
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

    /** Effect to update form values when selectedService changes */
    React.useEffect(() => {
        if(selectedService) {
            setServiceLoc({label: `${selectedService.qc_service_location_desc} : ${selectedService.qc_service_location}`, value: selectedService.service_location})
            setServiceDiscipline({label: `${selectedService.qc_service_discipline} : ${selectedService.qc_service_discipline_desc}`, value: selectedService.service_discipline})
            form.reset({
                service_id : selectedService.service_id ?? '',
                service_name : selectedService.service_name ?? '',
                service_location : selectedService.service_location ?? '',
                service_status : selectedService.service_status ?? false,
                service_description : selectedService.service_description ?? '',
                service_discipline : selectedService.service_discipline ?? '',
                no_of_counters : selectedService.no_of_counters ?? 0,
                counter_prefix : selectedService.counter_prefix ?? '',
                ticket_number_prefix : selectedService.ticket_number_prefix ?? '',
                recall_waiting_flag : selectedService.recall_waiting_flag ?? false,
                recall_waiting_time : selectedService.recall_waiting_time ?? 0,
                service_remarks1 : selectedService.service_remarks1 ?? '',
                service_remarks2 : selectedService.service_remarks2 ?? '',
                service_remarks3 : selectedService.service_remarks3 ?? '',
            })
        }
    }, [selectedService, form])

    const handleSubmit = async (data: UpdateServiceType) => {
        console.log("Submitting selectedService", data); // Debugging

        await updateService({
            service_id : data?.service_id ?? '',
            service_name : data?.service_name ?? '',
            service_location : data?.service_location ?? '',
            service_status : data?.service_status ?? false,
            service_description : data?.service_description ?? '',
            service_discipline : data?.service_discipline ?? '',
            no_of_counters : data?.no_of_counters ?? 0,
            counter_prefix : data?.counter_prefix ?? '',
            ticket_number_prefix : data?.ticket_number_prefix ?? '',
            recall_waiting_flag : data?.recall_waiting_flag ?? false,
            recall_waiting_time : data?.recall_waiting_time ?? 0,
            service_remarks1 : data?.service_remarks1 ?? '',
            service_remarks2 : data?.service_remarks2 ?? '',
            service_remarks3 : data?.service_remarks3 ?? '',
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
                form.reset();
                setServiceLoc(null);
                setServiceDiscipline(null);
                onClose();
            }
        })
        .catch(error => {
            console.error("Error updating service:", error);
            toast.error("Failed to update service");
        })
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Service</CardTitle>
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
                                        name='service_status'
                                        render={({ field }) => (
                                            <div className='flex items-center gap-3'>
                                                <label className='font-bold text-sm'>Status
                                                <Switch name='service_status'
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => form.setValue('service_status', checked, { shouldValidate: true })}
                                                />
                                                </label>
                                                <span>{field.value ? 'Active' : 'Inactive'}</span>
                                            </div>
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
                                <Button onClick={onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={updateServiceProps.isLoading}>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default UpdateService;