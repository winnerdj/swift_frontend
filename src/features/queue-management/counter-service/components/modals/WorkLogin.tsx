import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react'
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useWorkLoginMutation } from '@/lib/redux/api/work.api';
import { toast } from 'react-toastify';
import APISelect from '@/components/select/APISelect'; // Make sure this is the updated APISelect
import AvailableCounterSelect from '@/components/select/AvailableCounterSelect';
import { useAppDispatch } from "@/hooks/redux.hooks";
import { setWorkDetails } from "@/lib/redux/slices/work.slice";

interface WorkLoginProps {
    onClose: () => void;
    isOpen: boolean;
}

const workLoginSchema = yup.object({
    service: yup.string().required('Service is required.'),
    counter: yup.string().required('Counter is required.'),
});

type WorkLoginType = yup.InferType<typeof workLoginSchema>;


const WorkLogin: React.FC<WorkLoginProps> = (props) => {
    const dispatch = useAppDispatch();
    const [workLogin, WorkLoginProps] = useWorkLoginMutation();
    const [service, setService] = React.useState<{label: string; value:string} | null> (null);
    const [counter, setCounter] = React.useState<{label: string; value:string} | null> (null);

    const form = useForm<WorkLoginType>({
        resolver: yupResolver(workLoginSchema),
        defaultValues: {
            service: '',
            counter: ''
        }
    });

    const handleSubmit = async (data: WorkLoginType) => {
        console.log("Submitting data:", data);

        if(!service?.value) {
            toast.error("Service is required");
            return;
        }
        if(!counter?.value) {
            toast.error("Counter is required");
            return;
        }

        await workLogin({
            service_id: service?.value ?? '',
            counter_no: counter?.value ?? ''
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message && response.data) {
                toast.success(response.message);
                form.reset();
                setService(null);
                setCounter(null);
                props.onClose();
            }

            if(response.data) {
                let responseData = response.data
                dispatch(
                    setWorkDetails({
                        user_id: responseData.user_id.user_id,
                        activity: responseData.activity,
                        service_id: responseData.service_id,
                        location: responseData.location,
                        counter: responseData.counter,
                        user_status: responseData.user_status,
                        reason_code: responseData.reason_code
                    })
                );
            }
        })
        .catch(error => {
            console.error("Error in work login:", error);
            toast.error("Failed to work login");
        });
    };

    return (
        <Dialog open={props.isOpen} onClose={props.onClose} >
            <DialogPanel className="md:max-w-xl w-full">
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
                                <CardTitle>Work Login</CardTitle>
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
                                                        setService(selected);
                                                        // IMPORTANT: Reset the counter when service changes
                                                        form.setValue('counter', '');
                                                        setCounter(null);
                                                    }}
                                                    value={service}
                                                    placeholder='Select a service and location'
                                                    className='text-sm'
                                                />
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='counter'
                                        render={() => (
                                            <div className='space-y-2 flex flex-col gap-0'>
                                                <label className='font-bold font-sans text-sm leading-none mr-0 ml-0'>Available Counter</label>
                                                <AvailableCounterSelect
                                                    id='counter'
                                                    type={'available-counter'}
                                                    service_id={service?.value}
                                                    onChange={(selected) => {
                                                        const counterValue = selected?.value || '';
                                                        form.setValue('counter', counterValue, { shouldValidate: true });
                                                        setCounter(selected);
                                                    }}
                                                    value={counter}
                                                    placeholder='Select a counter'
                                                    className='text-sm'
                                                    isDisabled={!service?.value} // Disable until a service is selected
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-end'>
                                <Button type='submit' isLoading={WorkLoginProps.isLoading}>Login</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default WorkLogin;