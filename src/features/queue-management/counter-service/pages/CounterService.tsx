import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button'; // Assuming Shadcn UI Button
import { Input } from '@/components/ui/input'; // Assuming Shadcn UI Input

// import { getUserDetails } from "@/lib/redux/slices/auth.slice";
import { useGetTicketByLocationQuery } from '@/lib/redux/api/ticket.api';
import { getWorkSession, setQueueLogOut } from "@/lib/redux/slices/work.slice";
// import { useGetExistingWorkSessionDataQuery } from '@/lib/redux/api/work.api';
import { useAppSelector, useAppDispatch } from "@/hooks/redux.hooks";
import moment from 'moment';


// Import the WorkLogin component
import WorkLogin from '../components/modals/WorkLogin'; // Adjust the path as necessary

interface Ticket {
    ticket_id: string;
    ticket_number: string;
    ticket_service: string;
    service_name: string;
    service_location: string;
    ticket_status: number; // e.g., 5: waiting, 10: calling, 11: now_serving, 20: served, 21: no_show, 22: cancelled
    ticket_create_datetime: string; // ISO string
    ticket_counter?: number; // Counter assigned when calling/serving
}

interface GroupedQueueData {
    service_id: string;
    service_name: string;
    service_location: string;
    // service_discipline: string;
    no_of_counters: number;
    currentlyCallingTicketsByCounter: { [counter: number]: Ticket };
    waitingTickets: Ticket[];
}

// --- Component Start ---
const CounterService: React.FC = () => {
    const dispatch = useAppDispatch();

    // const userSessionDetails = useAppSelector(getUserDetails);
    const workSessionDetails = useAppSelector(getWorkSession);

    const [groupedQueueData, setGroupedQueueData] = useState<GroupedQueueData[]>([]);
    const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
    const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
    const [servingStartTime, setServingStartTime] = useState<number | null>(null);
    const [servingDuration, setServingDuration] = useState<string>('00:00:00'); // hh:mm:ss

    // State for Transfer Ticket
    const [transferToService, setTransferToService] = useState<string>('');

    // State for Ticket Status Override
    const [overrideTicketNumber, setOverrideTicketNumber] = useState<string>('');
    const [overrideTicketStatus, setOverrideTicketStatus] = useState<string>(''); // Will map to status codes
    const intervalRef = useRef<number | null>(null);

    // State for WorkLogin Dialog
    const [isWorkLoginOpen, setIsWorkLoginOpen] = useState<boolean>(false);


    const { data: ticketsResponse = { tickets: [], counters: [] },
        isLoading,
        isSuccess,
        error
    } = useGetTicketByLocationQuery(
        {
            serviceLocation: workSessionDetails?.location || 'undefined',
        },
        {
            pollingInterval: 60000, // Poll every 5 seconds for quick updates
            skip: !workSessionDetails?.location 
        }
    );


    const agentService = workSessionDetails?.service_id || 'null';
    const agentCounter = workSessionDetails?.counter || 'null';
    const agentLocation = workSessionDetails?.location || 'null';

    // Effect to check userWorkSessionDetails and open the WorkLogin dialog
    useEffect(() => {
        console.log('useEffect 1')
        // Assuming workSessionDetails contains user_service once logged in
        if (!workSessionDetails?.service_id) {
            setIsWorkLoginOpen(true);
        } else {
            setIsWorkLoginOpen(false);
        }
    }, [workSessionDetails?.service_id]);

    // Effect to process fetched tickets and group them by service_id and counter
    useEffect(() => {
        console.log('useEffect 2')
        if (isSuccess && ticketsResponse && ticketsResponse.tickets) {
            const allTickets: Ticket[] = ticketsResponse.tickets;
            const grouped: { [service_id: string]: GroupedQueueData } = {};

            allTickets.forEach(ticket => {
                if (!grouped[ticket.ticket_service]) {
                    grouped[ticket.ticket_service] = {
                        service_location: ticket.service_location,
                        // service_discipline: ticket.service_discipline,
                        no_of_counters: 0,
                        service_id: ticket.ticket_service,
                        service_name: ticket.service_name,
                        currentlyCallingTicketsByCounter: {},
                        waitingTickets: []
                    };
                }

                if (ticket.ticket_status === 11) { // Now Serving
                    // Check if this ticket is for the agent's current counter
                    if (ticket.ticket_counter === agentCounter) {
                        setCurrentTicket(ticket);
                        if (!servingStartTime) { // Only set start time if not already tracking
                            setServingStartTime(Date.now());
                        }
                    }
                } else if (ticket.ticket_status === 10) { // Calling / Pending Service
                    if (ticket.ticket_counter) {
                        grouped[ticket.ticket_service].currentlyCallingTicketsByCounter[ticket.ticket_counter] = ticket;
                        // If this calling ticket is for the agent's counter, set it as currentTicket
                        if (ticket.ticket_counter === agentCounter && !currentTicket) {
                            setCurrentTicket(ticket);
                        }
                    }
                } else if (ticket.ticket_status < 10) { // Waiting (assuming 1-9 are waiting states)
                    grouped[ticket.ticket_service].waitingTickets.push(ticket);
                }
            });

            Object.values(grouped).forEach(service_id => {
                service_id.waitingTickets.sort((a, b) =>
                    new Date(a.ticket_create_datetime).getTime() - new Date(b.ticket_create_datetime).getTime()
                );
            });

            const sortedGroupedData = Object.values(grouped).sort((a, b) =>
                a.service_name.localeCompare(b.service_name)
            );

            setGroupedQueueData(sortedGroupedData);
        }

        if (error) {
            console.error("Error fetching tickets:", error);
        }
    }, [isSuccess, ticketsResponse, error, agentCounter, servingStartTime, currentTicket]); // Added currentTicket to dep array for proper re-evaluation

    // Effect for serving duration timer
    useEffect(() => {
        console.log('useEffect 3')
        if (currentTicket && servingStartTime && currentTicket.ticket_status === 11) {
            intervalRef.current = window.setInterval(() => {
                const totalSeconds = Math.floor((Date.now() - servingStartTime) / 1000);
                const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
                const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
                const seconds = String(totalSeconds % 60).padStart(2, '0');
                setServingDuration(`${hours}:${minutes}:${seconds}`);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            // Only reset duration if there's no current ticket or it's not being served
            if (!currentTicket || currentTicket.ticket_status !== 11) {
                setServingDuration('00:00:00');
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [currentTicket, servingStartTime]);

    // --- Action Handlers (Placeholder Functions) ---
    // Function to fetch the next ticket to serve for this agent's counter
    const handleCallNextTicket = () => {
        if(isBreakTime) {
            alert('Please end your break before calling the next ticket.');
            return;
        }
        if(currentTicket) {
            alert('A ticket is already assigned. Please serve or dismiss it first.');
            return;
        }
        console.log("Action: Call Next Ticket for counter", agentCounter);
        // Simulate fetching the next ticket from the queue
        const nextWaitingTicket = groupedQueueData.flatMap(g => g.waitingTickets)
                                                     .find(ticket => ticket.ticket_status < 10); // Find first waiting
        if(nextWaitingTicket) {
            // Simulate API update: mark as calling (status 10) and assign to agent's counter
            const updatedTicket = { 
                ...nextWaitingTicket, 
                ticket_status: 10, 
                ticket_counter: typeof agentCounter === 'number' ? agentCounter : Number(agentCounter)
            };
            setCurrentTicket(updatedTicket); // Set as the ticket being 'called'
            setServingStartTime(null); // Reset timer until 'Now Serving'
            setServingDuration('00:00:00');
            console.log("Simulating calling ticket:", updatedTicket.ticket_number);
            // In a real app, you'd make an API call to update the ticket status on the server
        } else {
            alert("No more customers waiting for your assigned services.");
            console.log("No more waiting tickets in your assigned services.");
        }
    };

    const handleNowServing = () => {
        if (!currentTicket) {
            alert('No ticket to serve. Please call a ticket first.');
            return;
        }
        console.log("Action: Start Serving Ticket:", currentTicket.ticket_number);
        // Implement API call to update ticket status to 'Now Serving' (e.g., status 11)
        setCurrentTicket(prev => prev ? { ...prev, ticket_status: 11 } : null);
        setServingStartTime(Date.now()); // Start the timer
    };

    const handleRecall = () => {
        if (!currentTicket) return;
        console.log("Action: Recall Ticket:", currentTicket.ticket_number);
        // Implement API call to re-announce the ticket
    };

    const handleNoShow = () => {
        if (!currentTicket) return;
        if (window.confirm(`Mark ticket ${currentTicket.ticket_number} as No Show?`)) {
            console.log("Action: No Show for Ticket:", currentTicket.ticket_number);
            // Implement API call to update ticket status to 'No Show' (e.g., status 21)
            setCurrentTicket(null); // Clear current ticket
            setServingStartTime(null); // Reset timer
            // Optionally, auto-call next here or let polling handle it based on your system
            // handleCallNextTicket();
        }
    };

    const handleServed = () => {
        if (!currentTicket) return;
        console.log("Action: Served Ticket:", currentTicket.ticket_number);
        // Implement API call to update ticket status to 'Served' (e.g., status 20)
        setCurrentTicket(null); // Clear current ticket
        setServingStartTime(null); // Reset timer
        // Optionally, auto-call next here or let polling handle it based on your system
        // handleCallNextTicket();
    };

    const handleCancel = () => {
        if (!currentTicket) return;
        if (window.confirm(`Cancel ticket ${currentTicket.ticket_number}?`)) {
            console.log("Action: Cancel Ticket:", currentTicket.ticket_number);
            // Implement API call to update ticket status to 'Canceled' (e.g., status 22)
            setCurrentTicket(null); // Clear current ticket
            setServingStartTime(null); // Reset timer
            // Optionally, auto-call next here or let polling handle it based on your system
            // handleCallNextTicket();
        }
    };

    const handleToggleBreakTime = () => {
        if (currentTicket && !isBreakTime) {
            alert('Please complete or dismiss the current ticket before going on break.');
            return;
        }
        setIsBreakTime(prev => !prev);
        console.log("Agent Break Time Toggled:", !isBreakTime);
        // Implement API call to update agent's status if needed
    };

    const handleQueueLogout = () => {
        dispatch(setQueueLogOut())
    };

    const handleTransferTicket = () => {
        if (!currentTicket) {
            alert("No ticket is currently being served to transfer.");
            return;
        }
        if (!transferToService) {
            alert("Please select a service_id to transfer the ticket to.");
            return;
        }
        console.log(`Transferring ticket ${currentTicket.ticket_number} to service_id: ${transferToService}`);
        // Implement API call to transfer the ticket
        // On success, clear current ticket
        setCurrentTicket(null);
        setServingStartTime(null);
        setTransferToService('');
    };

    const handlePrintTicket = () => {
        if (!currentTicket) {
            alert("No ticket to print.");
            return;
        }
        console.log(`Printing ticket for ${currentTicket.ticket_number}`);
        // Implement logic to trigger ticket printing (e.g., API call to a print server)
    };

    const handleOverrideTicketStatus = () => {
        if (!overrideTicketNumber || !overrideTicketStatus) {
            alert("Please enter a ticket number and select a status to override.");
            return;
        }
        console.log(`Overriding ticket ${overrideTicketNumber} to status: ${overrideTicketStatus}`);
        // Implement API call to override ticket status (requires admin privileges typically)
        setOverrideTicketNumber('');
        setOverrideTicketStatus('');
    };

    // const totalWaitingTickets = groupedQueueData.reduce((sum, service_id) => sum + service_id.waitingTickets.length, 0);

    // Filter relevant tickets for the main display (Queued, Served)
    const allTickets = ticketsResponse.tickets || [];
    const queuedCount = allTickets.filter((t: Ticket) => t.ticket_status < 10).length; // Assuming <10 is waiting
    const servedCount = allTickets.filter((t: Ticket) => t.ticket_status === 20).length; // Assuming 20 is 'Served'

    // Get current time for header
    const currentHeaderTime = moment().format('hh:mm A');
    const currentHeaderDate = moment().format('YYYY-MM-DD'); // Matches image format

    // Determine button states based on currentTicket status
    const isNowServingActive = currentTicket && currentTicket.ticket_status === 11;
    const isRecallActive = currentTicket && currentTicket.ticket_status === 10;
    const isServedActive = currentTicket && currentTicket.ticket_status === 11;
    const isCancelActive = !!currentTicket; // Active if any ticket is assigned
    const isNoShowActive = !!currentTicket; // Active if any ticket is assigned

    const handleWorkLoginClose = () => {
        // This function will be called when the WorkLogin dialog is closed.
        // You might want to re-check workSessionDetails here or simply rely on Redux updates.
        // For now, we'll just close the modal.
        setIsWorkLoginOpen(false);
    };

    //If workSessionDetails?.service_id is not available, show the WorkLogin dialog
    if(workSessionDetails.activity === undefined) {
        return <WorkLogin isOpen={isWorkLoginOpen} onClose={handleWorkLoginClose} />;
    }

    return (
        <div className="grid gap-3 pl-2 pr-2">
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-md p-3 h-19 gap-x-4 bg-gray-50 shadow-2xs'>
                <div className="grid flex-1 items-center">
                    <span className='items'>Location: {agentLocation}</span>
                    <span>Service: {agentService}</span>
                    <span>Counter: {agentCounter}</span>
                </div>
                <div className="grid flex-1 items-center">
                    <span>Date: {currentHeaderDate}</span>
                    <span>Time: {currentHeaderTime}</span>
                </div>
            </div>

            {/* BODY */}
            <div className="flex flex-col w-full h-full bg-gray-300">
                {/* Main Content Area: Left Panel (Ticket, Buttons) and Right Panel (Stats, Overrides) */}
                <div className="flex flex-grow p-4 space-x-4">
                    {/* Left Panel */}
                    <div className="flex flex-col w-2/3 space-y-4">
                        {/* Current Ticket Display */}
                        <div className={`bg-blue-800 text-white p-6 ${currentTicket ? '' : 'flex justify-center items-center h-48'}`}>
                            {isLoading ? (
                                <p className="text-2xl text-center">Loading...</p>
                            ) : currentTicket ? (
                                <>
                                    <div className="text-lg font-bold">
                                        <span className="opacity-75">{currentTicket.service_name}: </span>
                                    </div>
                                    <h1 className="text-8xl font-bold text-center mt-4 mb-2">{currentTicket.ticket_number}</h1>
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

                        {/* Action Buttons Grid */}
                        <div className="grid grid-cols-2 gap-4 flex-grow">
                            {/* Left Column Buttons */}
                            <div className="flex flex-col space-y-4">
                                <Button
                                    className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400"
                                    onClick={handleRecall}
                                    disabled={!isRecallActive}
                                >
                                    Recall
                                </Button>
                                <Button
                                    className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400"
                                    onClick={handleNoShow}
                                    disabled={!isNoShowActive}
                                >
                                    No Show
                                </Button>
                            </div>

                            {/* Right Column Buttons */}
                            <div className="flex flex-col space-y-4">
                                {/* Conditional "Now Serving" or "Call Next Ticket" */}
                                {!currentTicket || currentTicket.ticket_status === 10 ? (
                                    <Button
                                        className={`p-4 h-auto text-xl font-bold border border-gray-400 ${
                                            isNowServingActive ? 'bg-blue-400 text-black' : 'bg-gray-200 text-black hover:bg-gray-300'
                                        }`}
                                        onClick={handleNowServing}
                                        disabled={!currentTicket || isBreakTime || currentTicket.ticket_status !== 10}
                                    >
                                        Now Serving
                                    </Button>
                                ) : (
                                    <Button
                                        className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400"
                                        onClick={handleCallNextTicket}
                                        disabled={isBreakTime || isLoading || !!currentTicket} // Disable if ticket assigned or on break
                                    >
                                        Call Next Ticket
                                    </Button>
                                )}

                                <Button
                                    className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400"
                                    onClick={handleServed}
                                    disabled={!isServedActive}
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

                        {/* Bottom Buttons (Break Time, Queue Log Out) */}
                        <div className="grid grid-cols-2 gap-4 mt-auto border-gray-300">
                            <Button className={`p-4 h-auto text-xl font-bold border border-gray-400 ${
                                        isBreakTime ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
                                    }`}
                                onClick={handleToggleBreakTime}
                            >
                                {isBreakTime ? "End Break" : "Break Time"}
                            </Button>
                            <Button className="bg-gray-200 text-black hover:bg-gray-300 p-4 h-auto text-xl font-bold border border-gray-400 flex items-center"
                                onClick={handleQueueLogout}
                                >Queue Log Out
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="flex flex-col w-1/3 space-y-4">
                        {/* Queued Section */}
                        <div className='border-1 border-gray-400'>
                            <div className="bg-red-600 text-white p-2 text-center text-xl font-bold">Queued:</div>
                            <div className="bg-white text-black p-2 text-center text-6xl font-bold border-gray-300">
                                {queuedCount}
                            </div>
                        </div>

                        {/* Served Section */}
                        <div className='border-1 border-gray-400'>
                            <div className="bg-orange-500 text-white p-3 text-center text-xl font-bold">Served:</div>
                            <div className="bg-white text-black p-3 text-center text-6xl font-bold border-gray-300">
                                {servedCount}
                            </div>
                        </div>

                        {/* Transfer Ticket Section */}
                        <div className='border-1 border-gray-400'>
                            <div className="bg-black text-white text-center text-xl font-bold">Transfer Ticket</div>
                            <div className="bg-gray-100 p-4 flex flex-col space-y-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-700 font-semibold text-lg">To Service:</span>
                                    {/* You'll need a select/dropdown for transferToService here */}
                                    {/* For demonstration, a placeholder input */}
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
                                    disabled={!currentTicket || !transferToService}
                                >
                                    Transfer
                                </Button>
                            </div>
                        </div>

                        {/* Ticket Status Override Section */}
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
                                    {/* You'll need a select/dropdown for overrideTicketStatus here */}
                                    {/* For demonstration, a placeholder input */}
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
                        {/* Print Ticket Button - Moved here for better UX given the image */}
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white p-3 h-auto text-lg font-bold mt-4"
                            onClick={handlePrintTicket}
                            disabled={!currentTicket}
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