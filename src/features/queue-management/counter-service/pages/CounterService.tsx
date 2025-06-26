import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import moment from 'moment';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    useGetExistingWorkSessionDataQuery,
    useLogoutWorkSessionMutation,
    useBreaktimeWorkSessionMutation,
    useGetActiveAssignedTicketQuery,
    useGetTicketsTodayByServiceIdQuery,
    usePostStartServingMutation,
    usePostEndServingMutation,
    usePostNoShowMutation
} from '@/lib/redux/api/work.api';
import { getWorkSession, setQueueLogOut, setWorkSession } from "@/lib/redux/slices/work.slice";
import { getUserDetails } from "@/lib/redux/slices/auth.slice";
import { useAppSelector, useAppDispatch } from "@/hooks/redux.hooks";
import recallSound from '@/assets/recall.mp3'; // Adjust this path to your actual file

import WorkLoginDialog from '../components/modals/WorkLoginDialog';

interface Ticket {
    ticket_id: string;
    ticket_number: string;
    ticket_service: string;
    service_name: string;
    ticket_support: string;
    service_location: string;
    ticket_status: number;
    ticket_create_datetime: string;
    ticket_counter?: number;
    ticket_now_serving_datetime?: string;
}

const CounterService: React.FC = () => {
    const dispatch = useAppDispatch();

    /** Login data in the swift system */
    const userSessionDetails = useAppSelector(getUserDetails);

    /** Login data in the work session */
    const workSessionDetails = useAppSelector(getWorkSession);

    const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
    const [servingDuration, setServingDuration] = useState<string>('00:00:00');

    const [transferToService, setTransferToService] = useState<string>('');
    const [overrideTicketNumber, setOverrideTicketNumber] = useState<string>('');
    const [overrideTicketStatus, setOverrideTicketStatus] = useState<string>('');

    const [postStartServing] = usePostStartServingMutation();
    const [postEndServing] = usePostEndServingMutation();
    const [postNoShow] = usePostNoShowMutation();
    const [logoutWorkSession] = useLogoutWorkSessionMutation();
    const [breaktimeWorkSession] = useBreaktimeWorkSessionMutation();

    // Fetch existing work session data
    const { data: existingWorkSessionData, isLoading: isLoadingWorkSession } = useGetExistingWorkSessionDataQuery(
        { user_id: userSessionDetails?.user_name ?? '' }
    );

    const { data: activeAssignedTicketData = { data : {} } } = useGetActiveAssignedTicketQuery(
        { user_id: userSessionDetails?.user_name ?? '' },
        {
            pollingInterval: 10000, // Poll every 10 seconds
            skip: isBreakTime, // Skip if on break
            refetchOnFocus: true, // Refetch when the window is focused
            refetchOnReconnect: true // Refetch when the browser reconnects
        }
    );

    const { data: ticketsResponse = { data: [] }, isLoading, } = useGetTicketsTodayByServiceIdQuery(
        {
            service_id : workSessionDetails?.service_id || 'undefined',
        },
        {
            pollingInterval: 30000,
            skip: !workSessionDetails?.service_id,
            refetchOnFocus: true, // Refetch when the window is focused
            refetchOnReconnect: true // Refetch when the browser reconnects
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

            setIsBreakTime(existingWorkSessionData.data.activity === 'Queue Breaktime');
        }
    }, [existingWorkSessionData, isLoadingWorkSession]);

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
    }, [activeAssignedTicketData, isBreakTime]); // Re-run effect when activeAssignedTicketData or isBreakTime changes


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
            ticket_id           : activeAssignedTicketData?.data?.ticket_id ?? '',
            ticket_no_show_datetime : moment().format('YYYY-MM-DD HH:mm:ss'),
            ticket_status       : 60 // 60 is the status for "No Show"
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
            ticket_id           : activeAssignedTicketData?.data?.ticket_id ?? '',
            ticket_served_datetime  : moment().format('YYYY-MM-DD HH:mm:ss'),
            ticket_status       : 100 // 70 is the status for "Now Serving"
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

    const handleCancel = () => {
        if (!activeAssignedTicketData?.data) return;
        if (window.confirm(`Cancel ticket ${activeAssignedTicketData.data.ticket_id}?`)) {
            console.log("Action: Cancel Ticket:", activeAssignedTicketData.data.ticket_id);
        }
    };

    const handleToggleBreakTime = async() => {
        console.log("🚀 ~ CounterService.tsx: ~ clicked handleToggleBreakTime.");

        try {
            let breaktimeResponse = await breaktimeWorkSession().unwrap();

            if(breaktimeResponse.success) {
                console.log('Work breaktime successfully.');
                setIsBreakTime(false)
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

    const handleTransferTicket = () => {
        if (!activeAssignedTicketData?.data) {
            alert("No ticket is currently being served to transfer.");
            return;
        }
        if (!transferToService) {
            alert("Please select a service_id to transfer the ticket to.");
            return;
        }
        console.log(`Transferring ticket ${activeAssignedTicketData.data.ticket_id} to service_id: ${transferToService}`);

        setTransferToService('');
    };

    const handlePrintTicket = () => {
        if (!activeAssignedTicketData?.data) {
            alert("No ticket to print.");
            return;
        }
        console.log(`Printing ticket for ${activeAssignedTicketData.data.ticket_id}`);
        // Implement print logic
    };

    const handleOverrideTicketStatus = () => {
        if (!overrideTicketNumber || !overrideTicketStatus) {
            alert("Please enter a ticket number and select a status to override.");
            return;
        }
        console.log(`Overriding ticket ${overrideTicketNumber} to status: ${overrideTicketStatus}`);
        // Dispatch action or API call to override ticket status
        setOverrideTicketNumber('');
        setOverrideTicketStatus('');
    };

    const allTickets = ticketsResponse.data || [];
    const queuedCount = allTickets.filter((t: Ticket) => t.ticket_status === 10).length;
    const servedCount = allTickets.filter((t: Ticket) => [100, 90, 60, 70, 50].includes(t.ticket_status) && t.ticket_support === userSessionDetails?.user_name ).length;

    const currentHeaderTime = moment().format('hh:mm A');
    const currentHeaderDate = moment().format('YYYY-MM-DD');

    /** Use activeAssignedTicketData for current ticket checks */
    const isNowServingActive = activeAssignedTicketData?.data && activeAssignedTicketData.data.ticket_status === 11;
    const isCancelActive = !!activeAssignedTicketData?.data;

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
            <div className='flex w-full items-center justify-end rounded-md p-3 h-19 gap-x-4 bg-gray-50 shadow-2xs'>
                <div className="grid flex-1 items-center">
                    <span>Location: {workSessionDetails?.location_desc || 'null'}</span>
                    <span>Service: {workSessionDetails?.service_name || 'null'}</span>
                    <span>Counter: {workSessionDetails?.counter || 'null'}</span>
                </div>
                <div className="grid flex-1 items-center">
                    <span>Date: {currentHeaderDate}</span>
                    <span>Time: {currentHeaderTime}</span>
                </div>
            </div>

            {/* BODY */}
            <div className="flex flex-col w-full h-full bg-gray-300">
                <div className="flex flex-grow p-4 space-x-4">
                    <div className="flex flex-col w-2/3 space-y-4">
                        <div className={`bg-blue-800 text-white p-6 ${activeAssignedTicketData?.data ? '' : 'flex justify-center items-center h-48'}`}>
                            {isLoading ? (
                                <p className="text-2xl text-center">Loading...</p>
                            ) : activeAssignedTicketData?.data ? (
                                <>
                                    <h1 className="text-6xl font-bold text-center mt-4 mb-2">{activeAssignedTicketData.data.ticket_id}</h1>
                                    <div className="text-xl text-center opacity-90">
                                        Time Elapsed: {servingDuration}
                                    </div>
                                </>
                            ) : (
                                <p className="text-3xl font-bold text-center">
                                    {isBreakTime ? "ON BREAK" : "READY"}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-grow">
                            <div className="flex flex-col space-y-4">
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

                            <div className="flex flex-col space-y-4">
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
                                    disabled={!isCancelActive}
                                >
                                    Cancel <span className="text-2xl ml-2">►</span>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-auto border-gray-300">
                            <Button className={`p-4 h-auto text-xl font-bold border border-gray-400 ${
                                        isBreakTime ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
                                    }`}
                                onClick={handleToggleBreakTime}
                                disabled={activeAssignedTicketData?.data?.ticket_id}
                            >
                                {isBreakTime ? "End Break" : "Break Time"}
                            </Button>
                            <Button className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400 flex items-center"
                                onClick={handleQueueLogout}
                                disabled={activeAssignedTicketData?.data?.ticket_id}
                                >Queue Log Out
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/3 space-y-4">
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
                            <div className="bg-gray-100 p-4 flex flex-col space-y-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-700 font-semibold text-lg">To Service:</span>
                                    <Input
                                        className="flex-grow bg-white border border-gray-300 text-black"
                                        value={transferToService}
                                        onChange={(e) => setTransferToService(e.target.value)}
                                        placeholder="Enter Service ID"
                                    />
                                </div>
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600 text-white p-3 h-auto text-lg font-bold"
                                    onClick={handleTransferTicket}
                                    disabled={!activeAssignedTicketData?.data || !transferToService}
                                >
                                    Transfer
                                </Button>
                            </div>
                        </div>

                        <div className='border-1 border-gray-400'>
                            <div className="bg-black text-white text-center text-xl font-bold">Ticket Status Override</div>
                            <div className="bg-gray-100 p-4 flex flex-col space-y-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-700 font-semibold text-lg">Ticket Number:</span>
                                    <Input
                                        className="flex-grow bg-white border border-gray-300 text-black"
                                        value={overrideTicketNumber}
                                        onChange={(e) => setOverrideTicketNumber(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-700 font-semibold text-lg">Ticket Status:</span>
                                    <Input
                                        className="flex-grow bg-white border border-gray-300 text-black"
                                        value={overrideTicketStatus}
                                        onChange={(e) => setOverrideTicketStatus(e.target.value)}
                                        placeholder="Enter Status Code"
                                    />
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
                            disabled={!activeAssignedTicketData?.data}
                        >
                            Print Ticket
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CounterService;