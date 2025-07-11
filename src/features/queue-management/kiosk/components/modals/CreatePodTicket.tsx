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
import axios from 'axios';
import html2canvas from 'html2canvas'; // *** Import html2canvas ***

const api = axios.create({
    baseURL: 'https://127.0.0.1:8081',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

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

    const sendPrintJobToBixolonSDK = async ({ createdTicket }: { createdTicket: any }) => {
        if (!createdTicket) {
            toast.error("No ticket data to print.");
            return;
        }

        const serviceName = createdTicket.selectedService?.service_name || "undefined";
        const serviceLocation = createdTicket.selectedService?.qc_service_location_desc || "undefined";
        const ticketNumber = createdTicket.response?.data?.ticket_id || "undefined";
        const ticketCreationDate = createdTicket.response?.data?.createdAt ?
            moment(createdTicket.response.data.createdAt).format('MM/DD/YYYY') : "undefined";
        const ticketCreationTime = createdTicket.response?.data?.createdAt ?
            moment(createdTicket.response.data.createdAt).format('LT') : "undefined";

        const generateBarcodeDataURL = (text: string): string => {
            if (!text || text === "undefined") return "";

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
                        font-size: 2.5em; /* This is a very large base font size, consider if this is intentional for thermal printer. It might make content too large. */
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
                        display: flex; /* Keep this to make label and value flex items */
                        align-items: baseline; /* Align text baselines */
                        /* REMOVE this line: margin-left: auto; */
                        justify-content: flex-start; /* Ensure content starts from the left */
                        flex-wrap: wrap; /* Allow items to wrap if line is too long */
                    }
                    .ticket-details .label {
                        display: inline-block; /* Keep as block for width to apply */
                        width: 70px; /* Increased width slightly for "Location:" to fit comfortably */
                        min-width: 70px; /* Ensures label doesn't shrink */
                        text-align: left;
                        margin-right: 120px;
                        flex-shrink: 0; /* Prevents the label from shrinking */
                    }
                    .ticket-details .value { /* New class for the value part */
                        display: inline-block;
                        flex-grow: 1; /* Allows the value to take up remaining space */
                        word-wrap: break-word; /* Breaks long words */
                        overflow-wrap: break-word; /* Modern equivalent for breaking long words */
                        hyphens: auto; /* Helps with hyphenation for better wrapping */
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
                            <p>
                            Paki-hintay po hanggang tawagin ang inyong ticket number. Salamat!
                            </p>
                        </div>

                        <div class="main-content">
                            <div class="primary-info"></div>
                            <div class="ticket-details">
                                <p>
                                    <span class="label">Location:</span>
                                    <span class="value">${serviceLocation}</span>
                                </p>
                                <p>
                                    <span class="label">Date:</span>
                                    <span class="value">${ticketCreationDate}</span>
                                </p>
                                <p>
                                    <span class="label">Time:</span>
                                    <span class="value">${ticketCreationTime}</span>
                                </p>
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

        try {
            // Create a temporary div to render the HTML content
            const printContentElement = document.createElement('div');
            printContentElement.innerHTML = printContentHtml;
            // Append it to the body temporarily to render it for html2canvas
            document.body.appendChild(printContentElement);

            // Use html2canvas to convert the HTML content to a canvas
            const canvas = await html2canvas(printContentElement, {
                // You might need to adjust these options for better rendering
                scale: 2, // Increase scale for higher resolution
                useCORS: true, // If your images/fonts are from different origins
                logging: false, // Disable logging for production
            });

            // Remove the temporary element
            document.body.removeChild(printContentElement);

            // Get the data URL (Base64 string) of the canvas image
            const canvasBase64 = canvas.toDataURL("image/png");

            // const requestBodyPrint = `{
            //     "id":1,
            //     "functions":{
            //         "func0":{"checkPrinterStatus":[]},
            //         "func1":{"printText":["Canvas Image Sample \\n\\n",0,0,false,false,false,0,0]},
            //         "func2":{"printBitmap":["${canvasBase64}",400,1,false]},
            //         "func3":{"printText":["\\n\\n\\n\\n\\n",0,0,false,false,false,0,0]},
            //         "func4":{"cutPaper":[1]}
            //     }
            // }`;

            const requestBodyPrint = `{
                "id":1,
                "functions":{
                    "func0":{"checkPrinterStatus":[]},
                    "func1":{"printText":["Canvas Image Sample \\n\\n",0,0,false,false,false,0,0]},
                    "func2":{"printBitmap":["${canvasBase64}",576,1,false]},
                    "func3":{"printText":["\\n\\n\\n\\n\\n",0,0,false,false,false,0,0]},
                    "func4":{"cutPaper":[1]}
                }
            }`;

            const response = await api.post('/WebPrintSDK/Printer1', requestBodyPrint);

            if (response.status === 200) {
                if (response.data && response.data.ResponseCode === 1000) {
                    toast.success('Ticket sent to BIXOLON printer successfully!');
                } else {
                    console.log('res', response);
                    toast.error(`Print command sent, but SDK reported an issue: ${response.data.Result || 'Unknown issue'}`);
                }
            } else {
                toast.error(`Failed to send print job to BIXOLON SDK. HTTP status: ${response.status}`);
                console.error("HTTP error sending to BIXOLON SDK:", response.status, response.statusText);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
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