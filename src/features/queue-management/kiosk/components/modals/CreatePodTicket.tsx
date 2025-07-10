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
import JsBarcode from 'jsbarcode';

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
                // *** CALL THE NEW SILENT PRINT FUNCTION HERE ***
                await sendPrintJobToBixolonSDK({ createdTicket }); // Make sure this is awaited
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

    // *** REVISED FUNCTION TO SEND PRINT JOB TO BIXOLON SDK ***
    const sendPrintJobToBixolonSDK = async ({ createdTicket }: { createdTicket: any }) => {
        if (!createdTicket) {
            toast.error("No ticket data to print.");
            return;
        }

        // Use the IP Address port from the SDK settings, as per documentation
        const BIXOLON_SDK_HTTP_PORT = 8081;
        const PRINTER_LOGICAL_NAME = "Printer1"; // This must match the "Logical Name" in your SDK

        // Construct the full URL for printing
        const BIXOLON_PRINT_URL = `http://127.0.0.1:${BIXOLON_SDK_HTTP_PORT}/WebPrintSDK/${PRINTER_LOGICAL_NAME}`;

        const serviceName = createdTicket.selectedService?.service_name || "undefined";
        const serviceLocation = createdTicket.selectedService?.qc_service_location_desc || "undefined";
        const ticketNumber = createdTicket.response?.data?.ticket_id || "undefined";
        const ticketCreationDate = createdTicket.response?.data?.createdAt ?
            moment(createdTicket.response.data.createdAt).format('MM/DD/YYYY') : "undefined";
        const ticketCreationTime = createdTicket.response?.data?.createdAt ?
            moment(createdTicket.response.data.createdAt).format('LT') : "undefined";

        // IMPORTANT: For barcode generation, it's generally more reliable to generate it
        // on a hidden canvas and then embed the resulting image data URL into your HTML.
        // The SDK's internal HTML renderer might not execute client-side JS (JsBarcode).
        // Let's create a helper for that.

        // Helper function to generate barcode as a data URL
        const generateBarcodeDataURL = (text: string): string => {
            if(!text || text === "undefined") return ""; // Return empty if no valid ticket number

            const canvas = document.createElement('canvas');
            try {
                // Adjust JsBarcode options for thermal printer
                JsBarcode(canvas, text, {
                    format: "CODE128", // Or "CODE39", "EAN13" depending on your needs
                    displayValue: true, // Show the number below the barcode
                    height: 50,         // Slightly taller for better scanning
                    width: 2,           // Thicker bars for clarity
                    margin: 5,          // Add some margin around the barcode
                    // textMargin: 1,   // Margin between barcode and text
                    // fontSize: 16,    // Font size for the value below
                    // background: "#ffffff",
                    // lineColor: "#000000",
                });
                return canvas.toDataURL("image/png"); // Get data URL as PNG
            } catch (error) {
                console.error("Error generating barcode:", error);
                return ""; // Return empty string on error
            }
        };

        const barcodeDataURL = generateBarcodeDataURL(ticketNumber);

        // Construct the HTML content for printing.
        // Ensure the HTML is simple and clean, as printer rendering engines can be basic.
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
                        width: 100%; /* Important for thermal receipt printers */
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
                        max-width: 100%; /* Ensure barcode fits within printer width */
                        height: auto;
                        display: block;
                        margin: 0 auto; /* Center the image */
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

        // The JSON payload structure for the BIXOLON Web Print SDK for printing HTML
        // Based on typical SDK patterns and the documentation mentioning "JSON data uses UTF-8 encoding"
        const requestBody = {
            data: printContentHtml, // The HTML content to be printed
            // The SDK's API reference doesn't explicitly show a "printType" field for this endpoint
            // when printing via POST /<PrinterName>. It assumes HTML or text based on data.
            // If it fails, you might need to experiment with adding "type": "HTML" or similar,
            // but for now, let's follow the implied structure.
            // Other possible parameters, if supported by the SDK (check full documentation):
            // cut: true, // Auto cut paper
            // cashDrawer: false, // Open cash drawer
            // charSet: "UTF-8",
        };

        try {
            const response = await fetch(BIXOLON_PRINT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // The documentation mentions `var serverURL in js`
                    // Some SDKs might require specific headers or tokens.
                    // If you encounter "unauthorized" errors, check for specific SDK requirements.
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // The SDK documentation (image_311c7b.png) shows a "Request for printing result"
                // This implies the initial POST might just acknowledge receipt, not completion.
                // For a kiosk, usually just sending the print job is enough for "silent print".
                // If you need confirmation, you'd implement the checkStatus endpoint.
                const responseData = await response.json(); // SDK might return a JSON response
                console.log("BIXOLON SDK response:", responseData);
                if (responseData && responseData.ResponseCode === 1000) { // Check for a known success code if provided
                    toast.success('Ticket sent to BIXOLON printer successfully!');
                } else {
                    toast.error(`Print command sent, but SDK reported an issue: ${responseData.ResponseText || 'Unknown issue'}`);
                }
            } else {
                toast.error(`Failed to send print job to BIXOLON SDK. HTTP status: ${response.status}`);
                console.error("HTTP error sending to BIXOLON SDK:", response.status, response.statusText);
            }
        } catch (error) {
            toast.error('Error connecting to BIXOLON printer SDK. Please ensure the SDK is running.');
            console.error("Network error connecting to BIXOLON SDK:", error);
        }
    };

    useEffect(() => {
        if (!isOpen) {
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