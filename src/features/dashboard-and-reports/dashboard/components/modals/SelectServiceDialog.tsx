import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import APISelect from '@/components/select/APISelect'; // Make sure this is the updated APISelect
import { useAppDispatch } from "@/hooks/redux.hooks";
import { setDashboardState } from "@/lib/redux/slices/dashboard.slice";

interface SelectServiceDialogProps {
    onClose: () => void;
    isOpen: boolean;
}

const workLoginSchema = yup.object({
    service: yup.string().required('Service is required.')
});

type SelectServiceDialogType = yup.InferType<typeof workLoginSchema>;

const SelectServiceDialog: React.FC<SelectServiceDialogProps> = (props) => {
    const dispatch = useAppDispatch();
    const [service, setService] = React.useState<{ label: string; value: string; location: string } | null>(null);
    // Add state for counter if it's being used in this dialog

    const form = useForm<SelectServiceDialogType>({
        resolver: yupResolver(workLoginSchema),
        defaultValues: {
            service: ''
        }
    });

    const handleSubmit = async () => {
        dispatch(setDashboardState({
            service_id: service?.value,
            service_location: service?.label.split(' : ')[1],
            service_name: service?.label.split(' : ')[0],
        }));

        props.onClose(); // Close the dialog after successful submission
    };

    return (
        <Dialog open={props.isOpen} onClose={props.onClose} >
            <DialogPanel className="md:max-w-xl w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(
                        () => {
                            handleSubmit();
                        }, (errors) => console.log("Form validation errors:", errors)
                    )}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Service for Dashboard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='service'
                                        render={() => (
                                            <div className='space-y-2 flex flex-col gap-0'>
                                                <label className='font-bold font-sans text-sm leading-none mr-0 ml-0'>Service and Location</label>
                                                <APISelect
                                                    id='service'
                                                    type={'service'} // Your service route type
                                                    onChange={(selected) => {
                                                        const serviceValue = selected?.value || '';
                                                        form.setValue('service', serviceValue, { shouldValidate: true });
                                                        setService(selected as { label: string; value: string; location: string });
                                                        // IMPORTANT: Reset the counter when service changes - This logic would be handled within the dashboard based on service_id change
                                                    }}
                                                    value={service}
                                                    placeholder='Select a service and location'
                                                    className='text-sm'
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-end'>
                                <Button type='submit' disabled={!service}>Submit</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default SelectServiceDialog;