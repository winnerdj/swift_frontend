import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { Dialog, DialogPanel } from '@/components/Dialog';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import { Button } from '@/components/ui/button';
import { useCancelTicketMutation } from '@/lib/redux/api/work.api';
import { ticketType } from '../../types';
import * as yup from 'yup';
import APISelect from '@/components/select/APISelect';

interface CancelTicketProps {
    onClose: () => void;
    isOpen: boolean;
    activeTicket: ticketType | null;
}

const cancelTicketSchema = yup.object({
    ticket_id           : yup.string().required('Ticket ID is required'),
    ticket_reason_code  : yup.string().required('Ticket Reason code is required'),
});

type CancelTicketType = yup.InferType<typeof cancelTicketSchema>;

const CancelTicket: React.FC<CancelTicketProps> = ({ isOpen, onClose, activeTicket }) => {

    console.log("🚀 ------------------------------------------------------🚀");
    console.log("🚀 ~ CancelTicket.tsx:30 ~ activeTicket:", activeTicket);
    console.log("🚀 ------------------------------------------------------🚀");

    const [cancelTicket, cancelTicketProps] = useCancelTicketMutation();
    const [reasonCode, setReasonCode] = React.useState<{label: string; value:string} | null> (null)

    const form = useForm<CancelTicketType>({
        resolver: yupResolver(cancelTicketSchema),
        defaultValues: {
            ticket_id : '',
            ticket_reason_code : '',
        }
    });

    /** Effect to update form values when activeTicket changes */
    React.useEffect(() => {
        if(activeTicket) {
            setReasonCode(null)
            form.reset({
                ticket_id           : activeTicket.ticket_id ?? '',
                ticket_reason_code  : '',
            })
        }
    }, [activeTicket, form])

    const handleSubmit = async (data: CancelTicketType) => {
        console.log("Submitting activeTicket", data); // Debugging

        await cancelTicket({
            ticket_id           : data?.ticket_id ?? '',
            ticket_reason_code  : reasonCode?.value ?? '',
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
                form.reset();
                setReasonCode(null);
                onClose();
            }
        })
        .catch(error => {
            console.error("Error cancelling ticket:", error);
            toast.error("Failed to cancel ticket");
        })
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-3xl w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Cancel Ticket</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='ticket_id'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Ticket ID' value={activeTicket?.ticket_id} placeholder='Ticket ID' autoCapitalize='off' autoComplete="off" spellCheck={false} autoCorrect="off" disabled={true}/>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='ticket_reason_code'
                                        render={() => (
                                            <div className='space-y-2 flex flex-col gap-0'>
                                                <label className='font-bold font-sans text-sm leading-none mr-0 ml-0'>Reason Code</label>
                                                <APISelect
                                                    id='ticket_reason_code'
                                                    type={'quickcode'}
                                                    qc_type={'cancel_ticket_reason'}
                                                    onChange={(selected) => {
                                                        form.setValue('ticket_reason_code', selected?.value || '', { shouldValidate: true })
                                                        setReasonCode(selected)
                                                    }}
                                                    value={reasonCode}
                                                    placeholder='Select reason code'
                                                    className='text-sm'
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={onClose} variant='destructive' type='button'>Close</Button>
                                <Button type='submit' isLoading={cancelTicketProps.isLoading}>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
}

export default CancelTicket;