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
import html2canvas from 'html2canvas';

const api = axios.create({
    baseURL: 'https://127.0.0.1:8081',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Request-Private-Network': true
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
            moment(createdTicket.response.data.createdAt).format('LTS') : "undefined";
        const generateBarcodeDataURL = (text: string): string => {
            if (!text || text === "undefined") return "";

            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, text, {
                    format: "CODE128",
                    displayValue: true,
                    // --- START MODIFICATION for Barcode Size ---
                    height: 80,
                    width: 3,
                    // --- END MODIFICATION for Barcode Size ---
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
                        width: 100%;
                        box-sizing: border-box;
                    }
                    .ticket-container {
                        padding: 5px;
                        width: 100%; /* Ensure the container uses full width */
                        box-sizing: border-box;
                    }
                    p {
                        margin: 0;
                        padding: 1px;
                    }
                    h1 {
                        font-size: 100px;
                        text-align: center;
                        margin: 5px 0;
                    }
                    .ticket-header {
                        font-size: 30px;
                        padding: 0 0 20px 0;
                    }
                    .ticket-number {
                        font-size: 170px;
                        font-weight: bold;
                        text-align: center;
                        padding: 0 0 100px 0;
                        border-top: 13px solid #000;
                        border-bottom: 13px solid #000;
                    }
                    .ticket-message {
                        font-size: 100px;
                        font-weight: 500;
                        text-align: center;
                    }
                    .barcode-container {
                        text-align: center; /* Keeps the image centered if it's smaller than the container */
                        border-top: 2px solid #000;
                        margin-top: 8px;
                        padding-top: 5px;
                        width: 100%; /* Explicitly set width to 90% of its parent (.ticket-container) */
                        box-sizing: border-box; /* Include padding in the width calculation */
                    }
                    .barcode-container img {
                        width: 100%; /* Make the image take up 100% of its parent's width */
                        max-width: 100%; /* Ensures it doesn't go over 100% if its intrinsic size is larger */
                        height: auto; /* Maintain aspect ratio */
                        display: block; /* Important for removing any extra space below the image */
                        margin: 0 auto; /* Keep it centered, though width: 100% will fill */
                    }
                    .barcode-label {
                        text-align: center;
                        font-size: 50px;
                    }
                    .main-content {
                        font-size: 85px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-top: 5px;
                        padding: 0 0 50px 0;
                    }
                    .primary-info {
                        flex: 0 0 35%; /* Adjusted for better 2/3 and 1/3 split, leaving room for gap */
                        padding-right: 5px;
                        box-sizing: border-box;
                    }
                    .ticket-details {
                        flex: 0 0 65%; /* Adjusted for better 2/3 and 1/3 split */
                        padding-left: 5px;
                        box-sizing: border-box;
                        min-width: unset;
                        display: flex;
                        flex-direction: column;
                    }
                    .ticket-details p {
                        display: flex;
                        align-items: baseline;
                        flex-wrap: nowrap; /* Keep label and value on one line for small content */
                    }
                    .ticket-details .label {
                        /* Increase min-width for labels to ensure they have enough space */
                        min-width: 4.7em; /* Increased from 2.5em; adjust as needed for longest label */
                        text-align: left;
                        flex-shrink: 0; /* Prevent the label from shrinking */
                    }
                    .ticket-details .value {
                        flex-grow: 1; /* Allow the value to take up remaining space */
                        word-wrap: break-word; /* Ensure long words break */
                        overflow-wrap: break-word; /* Standard property for word wrapping */
                        hyphens: auto; /* Allow hyphenation for better word breaking */
                        min-width: 0; /* Allow the flex item to shrink below its content size */
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
                            ${barcodeDataURL !== '' ? `<img src="${barcodeDataURL}" alt="Barcode ${ticketNumber}">` : '<p>Barcode not available</p>'}
                        </div>
                    </div>
                </body>
            </html>
        `;

        try {
            const printContentElement = document.createElement('div');
            printContentElement.innerHTML = printContentHtml;
            document.body.appendChild(printContentElement);

            const canvas = await html2canvas(printContentElement, {
                // You might need to adjust these options for better rendering
                scale: 2, // Increase scale for higher resolution
                useCORS: true, // If your images/fonts are from different origins
                logging: false, // Disable logging for production
            });

            document.body.removeChild(printContentElement);

            const canvasBase64 = canvas.toDataURL("image/png");

            const requestBodyPrint = `{
                "id":1,
                "functions":{
                    "func0":{"checkPrinterStatus":[]},
                    "func1":{"printText":["",0,0,false,false,false,0,0]},
                    "func2":{"printBitmap":["${canvasBase64}", 576, 1, false]},
                    "func3":{"printText":["\\n",0,0,false,false,false,0,0]},
                    "func4":{"cutPaper":[1]}
                }
            }`;

            const response = await api.post('/WebPrintSDK/Printer1', requestBodyPrint);

            if(response.status === 200) {
                if(response.data.Result === 'ready') {
                    toast.success('Ticket sent to BIXOLON printer successfully!');
                } else {
                    toast.error(`Print command sent, but SDK reported an issue: ${response.data.Result || 'Unknown issue'}`);
                }
            } else {
                toast.error(`Failed to send print job to BIXOLON SDK. HTTP status: ${response.status}`);
                console.error("HTTP error sending to BIXOLON SDK:", response.status, response.statusText);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Now 'error' is safely typed as AxiosError
                console.error("Axios error connecting to BIXOLON SDK:", error?.message, error?.response?.data);
            } else if (error instanceof Error) {
                // Handle generic JavaScript Error objects
                console.error("General error:", error?.message);
            } else {
                // Handle other unknown error types
                console.error("An unknown error occurred:", error);
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
                                <Button type='submit' isLoading={createTicketProps.isLoading} disabled={!formTicket.getValues('ticket_trip_number')}>Create Ticket</Button>
                                
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </DialogPanel>
        </Dialog>
    );
};

export default CreatePodTicket;