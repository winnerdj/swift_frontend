import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useCreateTicketMutation, useLazyGetTripDetailsQuery } from '@/lib/redux/api/ticket.api'; // ***CHANGED to useLazyGetTripDetailsQuery***
import { toast } from 'react-toastify';
import moment from 'moment';
import qz from 'qz-tray';

interface Service {
    service_id: string;
    service_name: string;
    service_location: string;
    service_status: number;
}

const createTicketSchema = yup.object({
    ticket_trip_number: yup.string().required('Ticket trip number is required'),
    ticket_vehicle_type: yup.string().required('Ticket vehicle type is required'),
    ticket_plate_num: yup.string().optional(),
    // ticket_trip_date: yup.date().required('Ticket trip date is required'),
    // ticket_remarks1: yup.string().nullable(),
    // ticket_remarks2: yup.string().nullable(),
    // ticket_remarks3: yup.string().nullable(),
    // Fields for the second form that are NOT part of createTicketSchema, but are needed for UI.
    // They will be set via formTicket.setValue, but don't need YUP validation for submission
    // unless you want to make them part of the ticket creation payload explicitly.
    tripStatus: yup.string().optional(),
    truckType: yup.string().optional(),
    plateNo: yup.string().optional(), // This conflicts with ticket_plate_num, be careful
    driverName: yup.string().optional(),
});

type CreatePodTicketType = yup.InferType<typeof createTicketSchema>;

const TripNumberSchema = yup.object({
    tripPlanNo: yup.string().required('Trip number is required'),
});
type FetchTripNumberType = yup.InferType<typeof TripNumberSchema>;

const CreatePodTicket: React.FC<{
    onClose: () => void;
    isOpen: boolean;
    selectedService: Service | null;
    onCreateTicket: (ticketNumber: number) => void;
}> = (props) => {
    const { onClose, isOpen, selectedService, onCreateTicket } = props;
    const [createTicket, createTicketProps] = useCreateTicketMutation();
    const [fetchTripDetails, { isFetching: isFetchingTrip, isLoading: isLoadingTrip }] = useLazyGetTripDetailsQuery();
    const [tripPlanValidationMessage, setTripPlanValidationMessage] = useState<string | null>(null);

    // Form for fetching trip number
    const formTrip = useForm<FetchTripNumberType>({
        resolver: yupResolver(TripNumberSchema),
        defaultValues: {
            tripPlanNo: ''
        }
    });

    // Form for creating the ticket
    const formTicket = useForm<CreatePodTicketType>({
        resolver: yupResolver(createTicketSchema),
        defaultValues: {
            ticket_trip_number: '',
            ticket_vehicle_type: '',
            ticket_plate_num: '',
            // ticket_trip_date: new Date(),
            tripStatus: '',
            truckType: '',
            plateNo: '',
            driverName: '',
        }
    });

    // Handle submission for the first form (fetching trip details)
    const handleFetchTripPlan = async (formData: FetchTripNumberType) => {
        setTripPlanValidationMessage(null); // Clear previous messages
        try {
            // ***Trigger the lazy query***
            const response = await fetchTripDetails({ tripPlanNo: formData.tripPlanNo }).unwrap();

            if (response && response.data.length > 0) {
                // Populate the second form with fetched data
                formTicket.setValue('ticket_trip_number', response.data[0].tripPlanNo || '');
                formTicket.setValue('ticket_vehicle_type', response.data[0].truckType || '');
                formTicket.setValue('ticket_plate_num', response.data[0].plateNo || '');

                // Populate read-only fields
                formTicket.setValue('tripStatus', response.data[0].tripStatus || '');
                formTicket.setValue('truckType', response.data[0].truckType || '');
                formTicket.setValue('plateNo', response.data[0].plate_number || '');
                formTicket.setValue('driverName', response.data[0].driverName || '');

                toast.success('Trip details fetched successfully!');
            } else {
                setTripPlanValidationMessage("No trip details found for this number.");
                toast.error("No trip details found.");
                // Optionally clear second form if data is not found
                formTicket.reset(formTicket.formState.defaultValues); // Reset to default, not to the last valid data
                // formTicket.setValue('ticket_trip_number', formData.tripPlanNo); // Keep the entered trip number
            }
        } catch (error: any) {
            console.error("Error fetching trip details:", error);
            const errorMessage = error?.data?.error || error?.message || "Failed to fetch trip details. Please try again.";
            setTripPlanValidationMessage(errorMessage);
            toast.error(errorMessage);
            formTicket.reset(formTicket.formState.defaultValues); // Clear the second form on error
            formTicket.setValue('ticket_trip_number', formData.tripPlanNo); // Keep the entered trip number
        }
    };

    // Handle submission for the second form (creating the ticket)
    const handleCreateTicket = async (data: CreatePodTicketType) => {
        try {
            const response = await createTicket({
                // Ensure you only send fields defined in your RTK Query mutation's expected payload
                ticket_service: selectedService?.service_id ?? '',
                ticket_level: 1,
                ticket_trip_number: data.ticket_trip_number,
                ticket_vehicle_type: data.ticket_vehicle_type,
                ticket_plate_num: data.ticket_plate_num
            }).unwrap();
            let createdTicket = {
                selectedService: selectedService,
                response: null
            };

            if (response.data) {
                console.log("Ticket created successfully:", response.data);
                createdTicket.response = response;
            }

            if (response.success && response.data) {
                toast.success(response.message);
                const newTicketNumber = response.ticket_number || Math.floor(Math.random() * 1000) + 1; // Use actual ticket number if available
                onCreateTicket(newTicketNumber);
                formTicket.reset();
                formTrip.reset();
                await handlePrintTicket({ createdTicket });
                onClose();
            }
            else if (response.error) {
                toast.error(response.error);
            }
            else {
                toast.error("An unexpected error occurred during ticket creation.");
            }
        }
        catch (error: any) {
            console.error("Error creating ticket:", error);
            const errorMessage = error?.data?.error || error?.message || "Failed to create ticket.";
            toast.error(errorMessage);
        }
    };

    const handlePrintTicket = async ({ createdTicket }: { createdTicket: any }) => {
        try {
            if (!createdTicket) {
                toast.error("No ticket data to print.");
                return;
            }

            await qz.websocket.connect();
            const config = qz.configs.create('BIXOLON SRP-E302'); // printer name
            // Construct dynamic data for the print window
            const serviceName = createdTicket.selectedService?.service_name || "undefined";
            const serviceLocation = createdTicket.selectedService?.qc_service_location_desc || "undefined";
            const ticketNumber = createdTicket.response?.data?.ticket_id || "undefined";
            const ticketCreationDate = createdTicket.response?.data?.createdAt ?
                moment(createdTicket.response.data.createdAt).format('MM/DD/YYYY') : "undefined";
            const ticketCreationTime = createdTicket.response?.data?.createdAt ?
                moment(createdTicket.response.data.createdAt).format('LT') : "undefined";

            const html = `
            <html>
            <head>
                <title>Ticket</title>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <style>
                    body {
                        font-family: 'Inter', sans-serif;
                        margin: 0;
                        color: #000;
                        font-size: 0.8em;
                    }
                    .ticket-container {
                        padding: 5px;
                        width: 100%;
                        box-sizing: border-box;
                    }
                    p {
                        margin: 0;
                        padding: 1px;
                    }
                    h1 {
                        font-size: 1.2em;
                        text-align: center;
                        margin: 5px 0;
                    }
                    .ticket-message {
                        font-size: 1em;
                        padding:0 5px;
                        font-weight: 600;
                    }
                    .ticket-number {
                        font-size: 1.8em;
                        font-weight: bold;
                        text-align: center;
                        margin: 8px 0;
                        padding: 5px;
                        border-top: 2px solid #000;
                        border-bottom: 2px solid #000;
                    }
                    #barcode {
                        max-width: 100%;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                    }
                    .barcode-container {
                        text-align: center;
                        border-top: 2px solid #000;
                        margin-top: 8px;
                        padding-top: 5px;
                        padding-left: 0px;
                        padding-right: 0px;
                    }
                    .barcode-label {
                        text-align: center;
                        font-size: 0.8em;
                    }
                    .main-content {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-top: 5px;
                    }
                    .primary-info, .ticket-details {
                        flex: 1;
                        min-width: 49%;
                        box-sizing: border-box;
                    }
                    .primary-info {
                        padding-right: 5px;
                    }
                    .ticket-details {
                        padding-left: 5px;
                    }
                    .ticket-details p {
                        display: flex;
                        align-items: baseline;
                        margin-left: auto;
                    }
                    .ticket-details .label {
                        display: inline-block;
                        width: 50px;
                        text-align: left;
                        margin-right: 5px;
                        flex-shrink: 0;
                    }
                    @media print {
                        body { margin: 0; }
                        .ticket-container {
                            border: none;
                            box-shadow: none;
                            max-width: none;
                            width: 100%;
                        }
                        script { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="ticket-container">
                    <div class="ticket-header">
                        <h1>${serviceName} Ticket Number</h1>
                    </div>
                    <div class="ticket-number">${ticketNumber}</div>
                    <div class="ticket-message">
                        <p>Paki-hintay po hanggang tawagin ang inyong ticket number. Salamat!</p>
                    </div>

                    <div class="main-content">
                        <div class="primary-info"></div>
                        <div class="ticket-details">
                            <p><span class="label">Location:</span>${serviceLocation}</p>
                            <p><span class="label">Date:</span>${ticketCreationDate}</p>
                            <p><span class="label">Time:</span>${ticketCreationTime}</p>
                        </div>
                    </div>

                    <div class="barcode-container">
                        <img id="barcode">
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        const ticketNumber = "${ticketNumber}"; // Get the dynamic ticket number
                        console.log('Print window onload. Ticket Number:', ticketNumber);

                        if(ticketNumber && ticketNumber !== "undefined") {
                            JsBarcode("#barcode", ticketNumber, {
                                format: "CODE128",
                                displayValue: true,
                                height: 35,
                                width: 1.5,
                                margin: 0,
                                background: "#ffffff",
                                lineColor: "#000000",
                                valid: function () {
                                    console.log('Barcode rendered, attempting to print...');
                                    setTimeout(() => {
                                        window.print();
                                        window.onafterprint = function() {
                                            console.log('After print, closing window.');
                                            window.close();
                                        };
                                    }, 150);
                                },
                                error: function(err) {
                                    console.error("JsBarcode error:", err);
                                    setTimeout(() => {
                                        window.print();
                                        window.onafterprint = function() {
                                            window.close();
                                        };
                                    }, 150);
                                }
                            });
                        } else {
                            console.error('Invalid ticket number for barcode generation. Printing without barcode.');
                            setTimeout(() => {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                };
                            }, 150);
                        }
                    };
                </script>
            </body>
            </html>
        `
            const data = [
                {
                    type: 'html',
                    format: 'plain',
                    data: html,
                }
            ];

            qz.print(config, data).catch(console.error).finally(async () => { await qz.websocket.disconnect(); });
        } catch (err) {
            throw new Error(`Printing failed: ${err}`);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            // Reset both forms when dialog closes
            formTrip.reset();
            formTicket.reset();
            setTripPlanValidationMessage(null);
        }
    }, [isOpen, formTrip, formTicket]); // Add formTrip and formTicket to dependency array

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                {/* FIRST FORM: Fetch Trip Details */}
                <Form {...formTrip}>
                    <form onSubmit={formTrip.handleSubmit(handleFetchTripPlan)}> {/* ***CORRECTED onSubmit*** */}
                        <Card className='border-white shadow-none'>
                            <CardHeader>
                                <CardTitle>Fetch Trip Details</CardTitle> {/* Changed title for clarity */}
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-3 gap-4'>
                                    <FormField
                                        control={formTrip.control} //* ***CORRECTED control to formTrip.control*** */
                                        name='tripPlanNo'
                                        className='col-span-2'
                                        render={({ field }) => (
                                            <FormInput
                                                {...field}
                                                label='Trip Number'
                                                placeholder='Enter trip number'
                                                autoCapitalize='on'
                                                autoComplete="off"
                                                spellCheck={false}
                                                autoCorrect="off"
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setTripPlanValidationMessage(null); // Clear error when input changes
                                                }}
                                            />
                                        )}
                                    />
                                    <div className='grid col-span-1 items-end'>
                                        <Button type='submit' isLoading={isFetchingTrip || isLoadingTrip}>
                                            {'Validate & Fetch Trip Details'}
                                        </Button>
                                    </div>
                                </div>
                                {tripPlanValidationMessage && ( // Display validation message here
                                    <p className="text-red-500 mt-2">{tripPlanValidationMessage}</p>
                                )}
                            </CardContent>
                        </Card>
                    </form>
                </Form>

                {/* --- */}
                {/* SECOND FORM: Create Ticket (Populated after fetching trip details) */}

                <Form {...formTicket}>
                    <form onSubmit={formTicket.handleSubmit(handleCreateTicket)}> {/* ***CORRECTED onSubmit and function name*** */}
                        <Card className='border-white shadow-none'>
                            <CardHeader>
                                <CardTitle>Create Ticket - {selectedService?.service_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-5 gap-4'>
                                    {/* These fields will be populated from tripDetailsData */}
                                    <FormField
                                        control={formTicket.control} // ***CORRECTED control to formTicket.control***
                                        name='ticket_trip_number' // This field is part of `createTicketSchema`
                                        className='grid col-span-1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Ticket Trip Number' placeholder='' autoComplete="off" spellCheck={false} autoCorrect="off" disabled />
                                        )}
                                    />
                                    <FormField
                                        control={formTicket.control}
                                        name='tripStatus' // Using the optional field from schema
                                        className='grid col-span-1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Trip Status' placeholder='' value={field?.value ?? ''} autoComplete="off" spellCheck={false} autoCorrect="off" disabled readOnly />
                                        )}
                                    />
                                    <FormField
                                        control={formTicket.control}
                                        name='ticket_plate_num'
                                        className='grid col-span-1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Plate Number' placeholder='' autoComplete="off" spellCheck={false} autoCorrect="off" disabled />
                                        )}
                                    />
                                    <FormField
                                        control={formTicket.control}
                                        name='truckType' // Using the optional field from schema
                                        className='grid col-span-1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Truck Type' placeholder='' value={field?.value ?? ''} autoComplete="off" spellCheck={false} autoCorrect="off" disabled />
                                        )}
                                    />
                                    <FormField
                                        control={formTicket.control}
                                        name='driverName' // Using the optional field from schema
                                        className='grid col-span-1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Driver Name' placeholder='' value={field?.value ?? ''} autoComplete="off" spellCheck={false} autoCorrect="off" disabled />
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button onClick={onClose} variant='destructive' type='button'>Cancel</Button>
                                <Button type='submit' isLoading={createTicketProps.isLoading}>Create Ticket</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
};

export default CreatePodTicket;