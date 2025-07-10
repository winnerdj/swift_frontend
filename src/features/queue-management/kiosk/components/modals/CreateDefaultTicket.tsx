import React from 'react';
import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateTicketMutation } from '@/lib/redux/api/ticket.api';
import { toast } from 'react-toastify';
import moment from 'moment';

interface Service {
    service_id: string;
    service_name: string;
    service_location: string;
    service_status: number;
}

const CreateDefaultTicket: React.FC<{
    onClose: () => void;
    isOpen: boolean;
    selectedService: Service | null;
    onCreateTicket: (ticketNumber: number) => void;
}> = (props) => {
    const { onClose, isOpen, selectedService, onCreateTicket } = props;
    const [createTicket] = useCreateTicketMutation();

    // Handle submission for the second form (creating the ticket)
    const handleCreateTicket = async() => {
        try {
            const response = await createTicket({
                // Ensure you only send fields defined in your RTK Query mutation's expected payload
                ticket_service: selectedService?.service_id ?? '',
                ticket_level: 1,
            }).unwrap();

            let createdTicket = {
                selectedService: selectedService,
                response: null
            };

            if(response.data) {
                console.log("Ticket created successfully:", response.data);
                createdTicket.response = response;
            }

            if(response.success && response.data) {
                toast.success(response.message);
                const newTicketNumber = response.ticket_number || Math.floor(Math.random() * 1000) + 1; // Use actual ticket number if available
                onCreateTicket(newTicketNumber);
                handlePrintTicket({ createdTicket });
                onClose();
            }
            else if(response.error) {
                toast.error(response.error);
            }
            else {
                toast.error("An unexpected error occurred during ticket creation.");
            }
        } 
        catch(error: any) {
            console.error("Error creating ticket:", error);
            const errorMessage = error?.data?.error || error?.message || "Failed to create ticket.";
            toast.error(errorMessage);
        }
    };

    const handlePrintTicket = ({ createdTicket }: { createdTicket: any }) => {
        if(!createdTicket) {
            toast.error("No ticket data to print.");
            return;
        }

        const printWindow = window.open('', '_blank');
        if(printWindow) {
            // Construct dynamic data for the print window
            const serviceName = createdTicket.selectedService?.service_name || "undefined";
            const serviceLocation = createdTicket.selectedService?.qc_service_location_desc || "undefined";
            const ticketNumber = createdTicket.response?.data?.ticket_id || "undefined";
            const ticketCreationDate = createdTicket.response?.data?.createdAt ?
                            moment(createdTicket.response.data.createdAt).format('MM/DD/YYYY') : "undefined";
            const ticketCreationTime = createdTicket.response?.data?.createdAt ?
                            moment(createdTicket.response.data.createdAt).format('LT') : "undefined";

            printWindow.document.write(`
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
            `);
            printWindow.document.close();
        } else {
            toast.error("Could not open print window. Please allow pop-ups.");
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-1xl w-full">
                        <Card className='border-white shadow-none'>
                            <CardHeader>
                                <CardTitle>Create Ticket</CardTitle> {/* Changed title for clarity */}
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-4'>
                                    <div className='grid col-span-1 items-end'>
                                    <Button onClick={() => handleCreateTicket()}>
                                        {'Print Ticket'}
                                    </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
            </DialogPanel>
        </Dialog>
    );
};

export default CreateDefaultTicket;