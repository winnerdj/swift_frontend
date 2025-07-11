import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useCreateTicketMutation, useLazyGetTripDetailsQuery } from '@/lib/redux/api/ticket.api';
import { toast } from 'react-toastify';
import moment from 'moment';
import JsBarcode from 'jsbarcode';
import axios from 'axios'; // *** Import Axios ***

const api = axios.create({
    baseURL: 'https://127.0.0.1:8081',
    headers: {
        'Content-Type':'application/x-www-form-urlencoded'
    }
})

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
    tripStatus: yup.string().optional(),
    truckType: yup.string().optional(),
    plateNo: yup.string().optional(),
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

    const formTrip = useForm<FetchTripNumberType>({
        resolver: yupResolver(TripNumberSchema),
        defaultValues: {
            tripPlanNo: ''
        }
    });

    const formTicket = useForm<CreatePodTicketType>({
        resolver: yupResolver(createTicketSchema),
        defaultValues: {
            ticket_trip_number: '',
            ticket_vehicle_type: '',
            ticket_plate_num: '',
            tripStatus: '',
            truckType: '',
            plateNo: '',
            driverName: '',
        }
    });

    const handleFetchTripPlan = async (formData: FetchTripNumberType) => {
        setTripPlanValidationMessage(null);
        try {
            const response = await fetchTripDetails({ tripPlanNo: formData.tripPlanNo }).unwrap();

            if (response && response.data.length > 0) {
                formTicket.setValue('ticket_trip_number', response.data[0].tripPlanNo || '');
                formTicket.setValue('ticket_vehicle_type', response.data[0].truckType || '');
                formTicket.setValue('ticket_plate_num', response.data[0].plateNo || '');

                formTicket.setValue('tripStatus', response.data[0].tripStatus || '');
                formTicket.setValue('truckType', response.data[0].truckType || '');
                formTicket.setValue('plateNo', response.data[0].plate_number || '');
                formTicket.setValue('driverName', response.data[0].driverName || '');

                toast.success('Trip details fetched successfully!');
            } else {
                setTripPlanValidationMessage("No trip details found for this number.");
                toast.error("No trip details found.");
                formTicket.reset(formTicket.formState.defaultValues);
            }
        } catch (error: any) {
            console.error("Error fetching trip details:", error);
            const errorMessage = error?.data?.error || error?.message || "Failed to fetch trip details. Please try again.";
            setTripPlanValidationMessage(errorMessage);
            toast.error(errorMessage);
            formTicket.reset(formTicket.formState.defaultValues);
            formTicket.setValue('ticket_trip_number', formData.tripPlanNo);
        }
    };

    const handleCreateTicket = async (data: CreatePodTicketType) => {
        try {
            const response = await createTicket({
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
                const newTicketNumber = response.ticket_number || Math.floor(Math.random() * 1000) + 1;
                onCreateTicket(newTicketNumber);
                formTicket.reset();
                formTrip.reset();
                await sendPrintJobToBixolonSDK({ createdTicket });
                onClose();
            } else if (response.error) {
                toast.error(response.error);
            } else {
                toast.error("An unexpected error occurred during ticket creation.");
            }
        }
        catch (error: any) {
            console.error("Error creating ticket:", error);
            const errorMessage = error?.data?.error || error?.message || "Failed to create ticket.";
            toast.error(errorMessage);
        }
    };

    // REVISED FUNCTION TO SEND PRINT JOB TO BIXOLON SDK USING AXIOS
    const sendPrintJobToBixolonSDK = async ({ createdTicket }: { createdTicket: any }) => {
        if (!createdTicket) {
            toast.error("No ticket data to print.");
            return;
        }

        // const BIXOLON_SDK_HTTP_PORT = 8081;
        // const PRINTER_LOGICAL_NAME = "Printer1";
        // const BIXOLON_PRINT_URL = `http://127.0.0.1:${BIXOLON_SDK_HTTP_PORT}/WebPrintSDK/${PRINTER_LOGICAL_NAME}`;

        const serviceName = createdTicket.selectedService?.service_name || "undefined";
        const serviceLocation = createdTicket.selectedService?.qc_service_location_desc || "undefined";
        const ticketNumber = createdTicket.response?.data?.ticket_id || "undefined";
        const ticketCreationDate = createdTicket.response?.data?.createdAt ?
            moment(createdTicket.response.data.createdAt).format('MM/DD/YYYY') : "undefined";
        const ticketCreationTime = createdTicket.response?.data?.createdAt ?
            moment(createdTicket.response.data.createdAt).format('LT') : "undefined";

        const generateBarcodeDataURL = (text: string): string => {
            if(!text || text === "undefined") return "";

            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, text, {
                    format: "CODE128",
                    displayValue: true,
                    height: 50,
                    width: 2,
                    margin: 5,
                });
                return canvas.toDataURL("image/png");
            } catch (error) {
                console.error("Error generating barcode:", error);
                return "";
            }
        };

        const barcodeDataURL = generateBarcodeDataURL(ticketNumber);

        const printContentHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Inter', sans-serif;
                        margin: 0;
                        color: #000;
                        font-size: 0.8em;
                        width: 100%;
                        box-sizing: border-box;
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
                        text-align: center;
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
                    .barcode-container {
                        text-align: center;
                        border-top: 2px solid #000;
                        margin-top: 8px;
                        padding-top: 5px;
                    }
                    .barcode-container img {
                        max-width: 100%;
                        height: auto;
                        display: block;
                        margin: 0 auto;
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
                </style>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
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
                        ${barcodeDataURL ? `<img src="${barcodeDataURL}" alt="Barcode ${ticketNumber}">` : '<p>Barcode not available</p>'}
                    </div>
                    ${barcodeDataURL ? `<div class="barcode-label">${ticketNumber}</div>` : ''}

                </div>
            </body>
            </html>
        `;

        // const requestBody = {
        //     data: printContentHtml,
        // };

        try {
            let canvasBase64 = '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'
            let requestBodyPrint = `{"id":1,"functions":{"func0":{"checkPrinterStatus":[]},"func1":{"printText":["Canvas Image Sample \n\n",0,0,false,false,false,0,0]},"func2":{"printBitmap":["data:image/png;base64,${canvasBase64}",400,1,false]},"func3":{"printText":["\n\n\n\n\n",0,0,false,false,false,0,0]},"func4":{"cutPaper":[1]}}}`
            const response = await api.post('/WebPrintSDK/Printer1', requestBodyPrint);

            if (response.status === 200) {
                if (response.data && response.data.ResponseCode === 1000) {
                    toast.success('Ticket sent to BIXOLON printer successfully!');
                } else {
                    console.log('res', response)
                    toast.error(`Print command sent, but SDK reported an issue: ${response.data.Result || 'Unknown issue'}`);
                }
            } else {
                toast.error(`Failed to send print job to BIXOLON SDK. HTTP status: ${response.status}`);
                console.error("HTTP error sending to BIXOLON SDK:", response.status, response.statusText);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Axios error, likely a network error or a CORS preflight failure
                console.error("Axios error connecting to BIXOLON SDK:", error.message, error.response?.data);
                if (error.code === 'ERR_NETWORK' || error.response?.status === 0) {
                    toast.error('Network error or CORS issue. Ensure BIXOLON SDK is running and configured correctly.');
                } else {
                    toast.error(`Error sending print job: ${error.response?.data?.error || error.message}`);
                }
            } else {
                console.error("Unknown error connecting to BIXOLON SDK:", error);
                toast.error('An unknown error occurred while connecting to the BIXOLON printer SDK.');
            }
        }
    };

    useEffect(() => {
        if (!isOpen) {
            formTrip.reset();
            formTicket.reset();
            setTripPlanValidationMessage(null);
        }
    }, [isOpen, formTrip, formTicket]);

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                <Form {...formTrip}>
                    <form onSubmit={formTrip.handleSubmit(handleFetchTripPlan)}>
                        <Card className='border-white shadow-none'>
                            <CardHeader>
                                <CardTitle>Fetch Trip Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-3 gap-4'>
                                    <FormField
                                        control={formTrip.control}
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
                                                    setTripPlanValidationMessage(null);
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
                                {tripPlanValidationMessage && (
                                    <p className="text-red-500 mt-2">{tripPlanValidationMessage}</p>
                                )}
                            </CardContent>
                        </Card>
                    </form>
                </Form>

                <Form {...formTicket}>
                    <form onSubmit={formTicket.handleSubmit(handleCreateTicket)}>
                        <Card className='border-white shadow-none'>
                            <CardHeader>
                                <CardTitle>Create Ticket - {selectedService?.service_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-5 gap-4'>
                                    <FormField
                                        control={formTicket.control}
                                        name='ticket_trip_number'
                                        className='grid col-span-1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Ticket Trip Number' placeholder='' autoComplete="off" spellCheck={false} autoCorrect="off" disabled />
                                        )}
                                    />
                                    <FormField
                                        control={formTicket.control}
                                        name='tripStatus'
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
                                        name='truckType'
                                        className='grid col-span-1'
                                        render={({ field }) => (
                                            <FormInput {...field} label='Truck Type' placeholder='' value={field?.value ?? ''} autoComplete="off" spellCheck={false} autoCorrect="off" disabled />
                                        )}
                                    />
                                    <FormField
                                        control={formTicket.control}
                                        name='driverName'
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