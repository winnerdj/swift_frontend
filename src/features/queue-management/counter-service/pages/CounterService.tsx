import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import moment from 'moment';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useDisclosure from '@/hooks/useDisclosure';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import axios from 'axios';

import {
    useGetExistingWorkSessionDataQuery,
    useLogoutWorkSessionMutation,
    useBreaktimeWorkSessionMutation,
    useGetActiveAssignedTicketQuery,
    useGetTicketsTodayByServiceIdQuery,
    usePostStartServingMutation,
    usePostEndServingMutation,
    usePostNoShowMutation,
    useOverrideTicketMutation,
    useTransferTicketMutation
} from '@/lib/redux/api/work.api';
import { getWorkSession, setQueueLogOut, setWorkSession } from "@/lib/redux/slices/work.slice";
import { getUserDetails } from "@/lib/redux/slices/auth.slice";
import { useAppSelector, useAppDispatch } from "@/hooks/redux.hooks";

import recallSound from '@/assets/recall.mp3';

import WorkLoginDialog from '../components/modals/WorkLoginDialog';
import CancelTicket from '../components/modals/CancelTicket';
import APISelect from '@/components/select/APISelect';

const api = axios.create({
    baseURL: 'https://127.0.0.1:8081',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Request-Private-Network': true
    }
});

interface Ticket {
    ticket_id: string;
    ticket_number: string;
    ticket_service: string;
    service_name: string;
    ticket_support: string;
    service_location: string;
    ticket_status: number;
    ticket_create_datetime: string;
    ticket_queue_datetime: string;
    ticket_counter?: number;
    ticket_now_serving_datetime?: string;
    qc_service_location_desc: string;
    createdAt?: string;
}

const CounterService: React.FC = () => {
    const counterServiceDisclosure = useDisclosure();
    const dispatch = useAppDispatch();

    /** Login data in the swift system */
    const userSessionDetails = useAppSelector(getUserDetails);

    /** Login data in the work session */
    const workSessionDetails = useAppSelector(getWorkSession);

    const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
    const [servingDuration, setServingDuration] = useState<string>('00:00:00');
    const [overrideTicketNumber, setOverrideTicketNumber] = useState<string>('');
    const [overrideTicketStatus, setOverrideTicketStatus] = useState<{label: string; value:string} | null> (null)
    const [transferToService, setTransferToService] = useState<{label: string; value:string} | null> (null)
    const [transferredNewTicketNumber, setTransferredNewTicketNumber] = useState<Ticket | null>(null);

    const [postStartServing] = usePostStartServingMutation();
    const [postEndServing] = usePostEndServingMutation();
    const [postNoShow] = usePostNoShowMutation();
    const [logoutWorkSession] = useLogoutWorkSessionMutation();
    const [breaktimeWorkSession] = useBreaktimeWorkSessionMutation();
    const [overrideTicket] = useOverrideTicketMutation();
    const [transferTicket] = useTransferTicketMutation();

    /** Fetch existing work session data */
    const { data: existingWorkSessionData, isLoading: isLoadingWorkSession } = useGetExistingWorkSessionDataQuery(
        { user_id: userSessionDetails?.user_name ?? '' }
    );

    /** Fetch activeAssignedTicketData to the user */
    const { data: activeAssignedTicketData = { data : {} }, isLoading: isLoadingActiveAssignedTicketData  } = useGetActiveAssignedTicketQuery(
        { user_id: workSessionDetails?.user_id ?? '' },
        {
            skip: !workSessionDetails?.user_id, // Skip if user_name is not set
            pollingInterval: 10000, // Poll every 10 seconds
            skipPollingIfUnfocused: true
        }
    );

    const { data: ticketsResponse = { data: [] }, isLoading, } = useGetTicketsTodayByServiceIdQuery(
        { service_id : workSessionDetails?.service_id || 'undefined' },
        {
            skip: !workSessionDetails?.service_id, // Skip if service_id is not set
            pollingInterval: 10000,  // Poll every 30 seconds
            skipPollingIfUnfocused: true
        }
    );

    // Create a ref for the audio element
    const recallSoundRef = useRef<HTMLAudioElement>(null);

    /** Effect to process fetched existing worksession based on the user activity log */
    useEffect(() => {
        console.log('useEffect 1')
        if(existingWorkSessionData?.data) {
            /** If there is existing work session data from the API, set it in Redux */
            dispatch(
                setWorkSession({
                    user_id: existingWorkSessionData.data.user_id,
                    activity: existingWorkSessionData.data.activity,
                    service_id: existingWorkSessionData.data.service_id,
                    service_name: existingWorkSessionData.data.service_name,
                    location: existingWorkSessionData.data.location,
                    location_desc: existingWorkSessionData.data.location_desc,
                    counter: existingWorkSessionData.data.counter,
                    user_status: existingWorkSessionData.data.user_status,
                    reason_code: existingWorkSessionData.data.reason_code
                })
            );

            setIsBreakTime(existingWorkSessionData.data.user_status === 'Available' ? false : true);
        }
    }, [existingWorkSessionData, isLoadingWorkSession, isBreakTime]);

    /** Effect to calculate and update servingDuration */
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (activeAssignedTicketData?.data?.ticket_status === 70 && activeAssignedTicketData.data.ticket_now_serving_datetime && !isBreakTime) {
            const startServingTime = moment(activeAssignedTicketData.data.ticket_now_serving_datetime);

            interval = setInterval(() => {
                const now = moment();
                const duration = moment.duration(now.diff(startServingTime));
                const hours = String(Math.floor(duration.asHours())).padStart(2, '0');
                const minutes = String(duration.minutes()).padStart(2, '0');
                const seconds = String(duration.seconds()).padStart(2, '0');
                setServingDuration(`${hours}:${minutes}:${seconds}`);
            }, 1000); // Update every second
        } else {
            setServingDuration('00:00:00');
        }

        return () => {
            clearInterval(interval); // Clean up the interval on component unmount or dependencies change
        };
    }, [activeAssignedTicketData, isLoadingActiveAssignedTicketData, isBreakTime]); // Re-run effect when activeAssignedTicketData or isBreakTime changes

    const handleStartServing = async() => {
        console.log("Action: Start Serving Ticket:", activeAssignedTicketData.data.ticket_id);

        if(!activeAssignedTicketData?.data?.ticket_id) {
            alert('No ticket to serve.');
            return;
        }

        await postStartServing({
            ticket_id                   : activeAssignedTicketData?.data?.ticket_id ?? '',
            ticket_now_serving_datetime : moment().format('YYYY-MM-DD HH:mm:ss'),
            ticket_status               : 70 // 70 is the status for "Now Serving"
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
            }
        })
        .catch(error => {
            console.error("Error to post start serving ticket:", error);
            toast.error("Failed to post start serving ticket.");
        })
    };

    const handleRecall = () => {
        if(!activeAssignedTicketData?.data) return; // Use activeAssignedTicketData here
        console.log("Action: Recall Ticket:", activeAssignedTicketData.data.ticket_id);

        /** Play the recall sound */
        if(recallSoundRef.current) {
            recallSoundRef.current.play().catch(error => {
                console.error("Error playing sound:", error);
            });
        }
    };

    const handleNoShow = async() => {
        console.log("Action: No Show Ticket:", activeAssignedTicketData.data.ticket_id);

        await postNoShow({
            ticket_id               : activeAssignedTicketData?.data?.ticket_id ?? '',
            ticket_no_show_datetime : moment().format('YYYY-MM-DD HH:mm:ss'),
            ticket_status           : 60 // 60 is the status for "No Show"
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
            }
        })
        .catch(error => {
            console.error("Error to post No Show ticket:", error);
            toast.error("Failed to post No Show ticket.");
        })
        // if (window.confirm(`Mark ticket ${activeAssignedTicketData.data.ticket_id} as No Show?`)) {
        //      console.log("Action: No Show for Ticket:", activeAssignedTicketData.data.ticket_id);
        // }
    };

    const handleServed = async() => {
        console.log("Action: Served Ticket:", activeAssignedTicketData.data.ticket_id);

        if(!activeAssignedTicketData?.data?.ticket_id) {
            alert('No ticket to serve.');
            return;
        }

        await postEndServing({
            ticket_id               : activeAssignedTicketData?.data?.ticket_id ?? '',
            ticket_served_datetime  : moment().format('YYYY-MM-DD HH:mm:ss'),
            ticket_status           : 100 // 100 is the status for "Served"
        })
        .unwrap()
        .then((response) => {
            if(response.success && response.message) {
                toast.success(response.message);
            }
        })
        .catch(error => {
            console.error("Error to post end serving ticket:", error);
            toast.error("Failed to post end serving ticket.");
        })
    };

    const handleCancel = async() => {
        console.log("Action: Cancel Ticket:", activeAssignedTicketData.data.ticket_id);
        counterServiceDisclosure.onOpen('cancelTicket');
    };

    const handleToggleBreakTime = async() => {
        console.log("🚀 ~ CounterService.tsx: ~ clicked handleToggleBreakTime.");

        try {
            let breaktimeResponse = await breaktimeWorkSession().unwrap();

            if(breaktimeResponse.success && breaktimeResponse?.data?.user_status === 'Breaktime') {
                console.log('Work breaktime successfully.');
                setIsBreakTime(true)
            }
            else if(breaktimeResponse.success && breaktimeResponse?.data?.user_status === 'Available') {
                console.log('Work breaktime ended successfully.');
                setIsBreakTime(false);
            }
            else {
                console.log('Work breaktime unsuccessful.');
            }
        } catch (err) {
            console.error('Failed to breaktime work session:', err);
        }
    };

    const handleQueueLogout = async() => {
        console.log("🚀 ~ CounterService.tsx: ~ clicked handleQueueLogout.");

        try {
            let logoutResponse = await logoutWorkSession().unwrap();

            if(logoutResponse.success) {
                console.log('Work logged out successfully.');
                dispatch(setQueueLogOut());
            }
            else {
                console.log('Work logged out unsuccessful.');
            }
        } catch (err) {
            console.error('Failed to log out work session:', err);
        }
    };

    const handleTransferTicket = async() => {
        console.log("🚀 ~ CounterService.tsx: ~ clicked handleTransferTicket.");

        try {
            if(!activeAssignedTicketData?.data && activeAssignedTicketData?.data?.ticket_status !== 70) {
                alert("No ticket is currently being served to transfer.");
                return;
            }

            let transferResponse = await transferTicket({
                ticket_id       : activeAssignedTicketData.data.ticket_id,
                ticket_service  : transferToService?.value || ''
            }).unwrap();

            if(transferResponse.success && transferResponse.data) {
                console.log('Ticket transfer successfully.');

                let newTicketData = {
                    ...transferResponse.data,
                    qc_service_location_desc: transferToService?.value || 'xxx',
                }

                setTransferredNewTicketNumber(newTicketData);
                toast.success(`Ticket transferred to ${transferToService?.label}. Kindly print the new ticket.`);
                // setTransferToService(null)
            }
            else {
                console.log('Ticket transfer unsuccessful.');
            }
        } catch (err) {
            console.error('Failed to transfer ticket:', err);
        }
    };

    const handlePrintTicket = async() => {

        console.log("🚀 -------------------------------------------------------------------------------------🚀");
        console.log("🚀 ~ CounterService.tsx:322 ~ transferredNewTicketNumber:", transferredNewTicketNumber);
        console.log("🚀 -------------------------------------------------------------------------------------🚀");

        if(!transferredNewTicketNumber) {
            toast.error("No ticket data to print.");
            return;
        }

        const sendPrintJobToBixolonSDK = async ({ createdTicket }: { createdTicket: any }) => {
            if (!createdTicket) {
                toast.error("No ticket data to print.");
                return;
            }

            const serviceName = transferToService?.label.split(':')[0] || "undefined";
            const serviceLocation = workSessionDetails?.location_desc || "undefined";
            const ticketNumber = createdTicket?.ticket_id || "undefined";
            const ticketCreationDate = createdTicket?.createdAt ?
                moment(createdTicket.createdAt).format('MM/DD/YYYY') : "undefined";
            const ticketCreationTime = createdTicket?.createdAt ?
                moment(createdTicket.createdAt).format('LT') : "undefined";

            const generateBarcodeDataURL = (text: string): string => {
                if (!text || text === "undefined") return "";

                const canvas = document.createElement('canvas');
                try {
                    JsBarcode(canvas, text, {
                        format: "CODE128",
                        displayValue: true,
                        height: 80,
                        width: 3,
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
                            font-size: 100px; /* Very large base font size. Be mindful of print dimensions. */
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
                            font-size: 1.2em;
                            text-align: center;
                            margin: 5px 0;
                        }
                        .ticket-header {
                            font-size: 1;
                            padding: 0 0 20px 0;
                        }
                        .ticket-number {
                            font-size: 1.8em;
                            font-weight: bold;
                            text-align: center;
                            padding: 0 0 100px 0;
                            border-top: 13px solid #000;
                            border-bottom: 13px solid #000;
                        }
                        .ticket-message {
                            font-size: 1em;
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
                            font-size: 0.5em;
                        }
                        .main-content {
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
                    scale: 2,
                    useCORS: true,
                    logging: false,
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

                if (response.status === 200) {
                    if (response.data.Result === 'ready') {
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
                    console.error("Axios error connecting to BIXOLON SDK:", error?.message, error?.response?.data);
                } else if (error instanceof Error) {
                    console.error("General error:", error?.message);
                } else {
                    console.error("An unknown error occurred:", error);
                }
            }
        };

        await sendPrintJobToBixolonSDK({ createdTicket: transferredNewTicketNumber })
        setTransferToService(null)
    };

    const handleOverrideTicketStatus = async() => {
        if(!overrideTicketNumber && !overrideTicketStatus) {
            alert("Please enter a ticket number and select a status to override.");
            return;
        }
        console.log(`Overriding ticket ${overrideTicketNumber} to status: ${overrideTicketStatus}`);

        let overrideResponse = await overrideTicket({
            ticket_id       : overrideTicketNumber,
            ticket_service  : workSessionDetails?.service_id || '',
            ticket_status   : overrideTicketStatus?.value || '',
            ticket_counter  : workSessionDetails?.counter || null,
        }).unwrap();

        if(overrideResponse.success && overrideResponse.data) {
            toast.success(`Ticket ${overrideTicketNumber} status overridden to ${overrideTicketStatus?.label} and assigned to ${userSessionDetails?.user_name}.`);
            setOverrideTicketNumber('');
            setOverrideTicketStatus(null);
        } else {
            toast.error(`Failed to override ticket ${overrideTicketNumber} status.`);
        }
    };

    const allTickets = ticketsResponse.data || [];
    const queuedCount = allTickets.filter((t: Ticket) => t.ticket_status === 10).length;
    const servedCount = allTickets.filter((t: Ticket) => [100, 90, 60, 70, 50].includes(t.ticket_status) && t.ticket_support === userSessionDetails?.user_name ).length;

    const currentHeaderTime = moment().format('hh:mm A');
    const currentHeaderDate = moment().format('YYYY-MM-DD');

    /** Use activeAssignedTicketData for current ticket checks */
    const isNowServingActive = activeAssignedTicketData?.data && activeAssignedTicketData.data.ticket_status === 70;

    const handleWorkLoginDialogClose = () => {
        console.log("WorkLoginDialog closed.");
        // If the dialog is closed, we can reset the work session details in Redux.
        // This will trigger the dialog to reappear if the user tries to access the counter service again.
        dispatch(setQueueLogOut());
    };

    /** Render the WorkLoginDialog if there's no work session data in Redux.
        This makes the dialog the primary gatekeeper for the counter service. */
    if(!workSessionDetails?.service_id && workSessionDetails?.activity != 'Queue Breaktime') { // Check if Redux workSessionDetails is empty/null
        return <WorkLoginDialog isOpen={true} onClose={handleWorkLoginDialogClose} />;
    }

    return (
        <div className="grid gap-3 pl-2 pr-2">
            {/* Hidden audio element for the recall sound */}
            <audio ref={recallSoundRef} src={recallSound} preload="auto" />

            {/* HEADER */}
            <div className='flex w-full items-center justify-between rounded-md p-3 h-19 gap-x-4 bg-gray-50 shadow-2xs'>
                <div className="flex flex-col flex-1 items-start justify-center">
                    <span>Location: {workSessionDetails?.location_desc || 'null'}</span>
                    <span>Service: {workSessionDetails?.service_name || 'null'}</span>
                    <span>Counter: {workSessionDetails?.counter || 'null'}</span>
                </div>
                <div className="flex flex-col flex-1 items-end justify-center">
                    <span>Date: {currentHeaderDate}</span>
                    <span>Time: {currentHeaderTime}</span>
                </div>
            </div>

            {/* BODY */}
            <div className="flex flex-col w-full h-full bg-gray-300">
                <div className="flex flex-grow p-4 gap-x-4">
                    <div className="flex flex-col w-2/3 gap-4">
                        <div className={`bg-blue-800 text-white p-6 ${activeAssignedTicketData?.data ? '' : 'flex justify-center items-center h-48'}`}>
                            {isLoading ? (
                                <p className="text-2xl text-center">Loading...</p>
                            ) : activeAssignedTicketData?.data ? (
                                <>
                                    <h1 className="text-6xl font-bold text-center mt-4 mb-2">{activeAssignedTicketData.data.ticket_id}</h1>
                                    <div className="text-2xl text-center opacity-90">
                                        Time Elapsed: {servingDuration}
                                    </div>
                                </>
                            ) : (
                                <p className="text-5xl font-bold text-center">
                                    {isBreakTime ? "ON BREAK" : "READY"}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-row gap-4 flex-grow">
                            <div className="flex flex-col gap-4 flex-1">
                                <Button
                                    className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400"
                                    onClick={handleRecall}
                                    disabled={
                                        !activeAssignedTicketData?.data?.ticket_id ||
                                        ![50, 60].includes(activeAssignedTicketData?.data?.ticket_status)
                                    }
                                >
                                    Recall
                                </Button>
                                <Button
                                    className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400"
                                    onClick={handleNoShow}
                                    disabled={
                                        !activeAssignedTicketData?.data?.ticket_id ||
                                        [70].includes(activeAssignedTicketData?.data?.ticket_status)
                                    }
                                >
                                    No Show
                                </Button>
                            </div>

                            <div className="flex flex-col gap-4 flex-1">
                                <Button
                                    className={`p-4 h-auto text-xl font-bold border border-gray-400 ${
                                        isNowServingActive ? 'bg-blue-400 text-black' : 'bg-gray-200 text-black hover:bg-gray-300'
                                    }`}
                                    onClick={handleStartServing}
                                    disabled={!activeAssignedTicketData?.data?.ticket_id || isBreakTime || activeAssignedTicketData?.data?.ticket_status === 70}
                                >
                                    { activeAssignedTicketData?.data?.ticket_id &&
                                        activeAssignedTicketData?.data?.ticket_status === 50 ?
                                        'Start Serving' :
                                        activeAssignedTicketData?.data?.ticket_id &&
                                        activeAssignedTicketData?.data?.ticket_status === 70 ? 'Now Serving' : 'Start Serving' }
                                </Button>

                                <Button
                                    className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400"
                                    onClick={handleServed}
                                    disabled={isBreakTime || !activeAssignedTicketData?.data?.ticket_id || [50].includes(activeAssignedTicketData?.data?.ticket_status)}
                                >
                                    Served
                                </Button>

                                <Button
                                    className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400 flex items-center justify-between"
                                    onClick={handleCancel}
                                >
                                    Cancel <span className="text-2xl ml-2">►</span>
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-row gap-4 mt-auto border-gray-300">
                            <Button className={`flex-1 p-4 h-auto text-xl font-bold border border-gray-400 ${
                                        isBreakTime ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
                                    }`}
                                onClick={handleToggleBreakTime}
                                disabled={activeAssignedTicketData?.data?.ticket_id}
                            >
                                {isBreakTime ? "End Break" : "Break Time"}
                            </Button>
                            <Button className="flex-1 bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400 flex items-center"
                                onClick={handleQueueLogout}
                                disabled={activeAssignedTicketData?.data?.ticket_id}
                                >Queue Log Out
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/3 gap-4">
                        <div className='border-1 border-gray-400'>
                            <div className="bg-red-600 text-white p-2 text-center text-xl font-bold">Queued:</div>
                            <div className="bg-white text-black p-2 text-center text-6xl font-bold border-gray-300">
                                {queuedCount}
                            </div>
                        </div>

                        <div className='border-1 border-gray-400'>
                            <div className="bg-orange-500 text-white p-3 text-center text-xl font-bold">Served:</div>
                            <div className="bg-white text-black p-3 text-center text-6xl font-bold border-gray-300">
                                {servedCount}
                            </div>
                        </div>

                        <div className='border-1 border-gray-400'>
                            <div className="bg-black text-white text-center text-xl font-bold">Transfer Ticket</div>
                            <div className="bg-gray-100 p-4 flex flex-col gap-4">
                                <div className="flex items-center gap-x-2">
                                    <span className="text-gray-700 font-semibold text-lg">To Service:</span>
                                    <div className="flex-grow text-black">
                                        <APISelect
                                            id='transfer-ticket-service'
                                            type={'transfer-service'}
                                            onChange={(selected) => {
                                                setTransferToService(selected)
                                            }}
                                            value={transferToService}
                                            placeholder='Select ticket status'
                                            className='text-md text-black'
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600 text-white p-3 h-auto text-lg font-bold"
                                    onClick={handleTransferTicket}
                                    disabled={activeAssignedTicketData?.data?.ticket_status != 70 || !transferToService}
                                >
                                    Transfer
                                </Button>
                            </div>
                        </div>

                        <div className='border-1 border-gray-400'>
                            <div className="bg-black text-white text-center text-xl font-bold">Ticket Status Override</div>
                            <div className="bg-gray-100 p-4 flex flex-col gap-4">
                                <div className="flex items-center gap-x-2">
                                    <span className="text-gray-700 font-semibold text-lg">Ticket Number:</span>
                                    <Input
                                        className="flex-grow bg-white border border-gray-300 text-black"
                                        value={overrideTicketNumber}
                                        onChange={(e) => setOverrideTicketNumber(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <span className="text-gray-700 font-semibold text-lg">Ticket Status:</span>
                                    <div className="flex-grow text-black">
                                        <APISelect
                                            id='override-ticket-status'
                                            type={'quickcode'}
                                            qc_type={'override_ticket_status'}
                                            onChange={(selected) => {
                                                setOverrideTicketStatus(selected)
                                            }}
                                            value={overrideTicketStatus}
                                            placeholder='Select ticket status'
                                            className='text-md text-black'
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600 text-white p-3 h-auto text-lg font-bold"
                                    onClick={handleOverrideTicketStatus}
                                    disabled={!overrideTicketNumber || !overrideTicketStatus}
                                >
                                    Override
                                </Button>
                            </div>
                        </div>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white p-3 h-auto text-lg font-bold mt-4"
                            onClick={handlePrintTicket}
                            disabled={!transferredNewTicketNumber}
                        >
                            Print Ticket{ transferredNewTicketNumber ? ` - ${transferredNewTicketNumber.ticket_id}` : ''}
                        </Button>
                    </div>
                </div>
            </div>
            <CancelTicket isOpen={counterServiceDisclosure.isOpen('cancelTicket')} onClose={() => counterServiceDisclosure.onClose('cancelTicket')} activeTicket={activeAssignedTicketData?.data} />
        </div>
    );
};

export default CounterService;