import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize } from 'lucide-react';
import { useGetTicketByLocationQuery } from '@/lib/redux/api/ticket.api'; // Keep this import for production
import { getUserDetails } from "@/lib/redux/slices/auth.slice";
import { useAppSelector } from "@/hooks/redux.hooks";

// Define the structure for an individual ticket
interface Ticket {
    ticket_id: string;
    ticket_name: string;
    service_id: string;
    service_name: string; // Crucial for grouping tickets by service
    ticket_counter?: string; // The counter calling the ticket (optional, as some might not have a counter yet)
    ticket_status: number; // More descriptive statuses or a generic string
    ticket_level: number; // More descriptive statuses or a generic string
    ticket_create_datetime: string; // Timestamp when the ticket was created, useful for sorting waiting queue
    ticket_queue_datetime: string; // Timestamp when the ticket was created, useful for sorting waiting queue
    service_location: string;
    service_description: string;
    service_discipline: string;
    no_of_counters: string;
}

// Updated structure for grouped queue data:
// Now, 'currentlyCallingTicketsByCounter' maps counter names to the ticket they are serving.
interface GroupedQueueData {
    service_id: string;
    service_name: string;
    service_location: string;
    service_description: string;
    service_discipline: string;
    no_of_counters: string;
    currentlyCallingTicketsByCounter: { [counterName: string]: Ticket }; // Key: ticket_counter, Value: Ticket
    waitingTickets: Ticket[]; // Tickets waiting for ANY counter of this service
}

const QueueDisplay: React.FC = () => {
    const userSessionDetails = useAppSelector(getUserDetails);
    const [groupedQueueData, setGroupedQueueData] = useState<GroupedQueueData[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const kioskRef = useRef<HTMLDivElement>(null); // This ref will be on the main container that goes fullscreen

    const {
        data: ticketsResponse = { tickets: [], counters: [] }, // Default to empty data structure
        isLoading,
        isSuccess,
        error
    } = useGetTicketByLocationQuery(
        {
            serviceLocation: userSessionDetails?.user_location || 'undefined',
        },
        {
            pollingInterval: 3000, // Reduced polling to 3 seconds, still real-time enough
            skipPollingIfUnfocused: true
        }
    );

    // Effect to process fetched tickets and group them by service and counter
    useEffect(() => {
        if(isSuccess && ticketsResponse && ticketsResponse.tickets) {
            console.log("Fetched tickets:", ticketsResponse.tickets[0]);
            const allTickets: Ticket[] = ticketsResponse.tickets as Ticket[];

            const grouped: { [service_id: string]: GroupedQueueData } = {};

            allTickets.forEach(ticket => {
                // Initialize service entry if it doesn't exist
                if(!grouped[ticket.service_id]) {
                    grouped[ticket.service_id] = {
                        service_location: ticket.service_location,
                        service_description: ticket.service_description,
                        service_discipline: ticket.service_discipline,
                        no_of_counters: ticket.no_of_counters,
                        service_id: ticket.service_id,
                        service_name: ticket.service_name,
                        currentlyCallingTicketsByCounter: {},
                        waitingTickets: []
                    };
                }

                // Check for tickets currently being served (status > 10, not completed/cancelled/no-show)
                // Assuming '10' means waiting, and other statuses like 100 (Done), 90 (No Show), 60 (Cancelled)
                if (ticket.ticket_status > 10 && ![100, 90, 60].includes(ticket.ticket_status)) {
                    // Ensure ticket_counter exists for calling tickets
                    if (ticket.ticket_counter) {
                        grouped[ticket.service_id].currentlyCallingTicketsByCounter[ticket.ticket_counter] = ticket;
                    }
                } else if (ticket.ticket_status <= 10) { // Assuming <= 10 means waiting or queued
                    grouped[ticket.service_id].waitingTickets.push(ticket);
                }
            });

            // Sort waiting tickets for each service by creation time
            Object.values(grouped).forEach(service => {
                service.waitingTickets.sort((a, b) =>
                    new Date(a.ticket_queue_datetime).getTime() - new Date(b.ticket_queue_datetime).getTime()
                );
            });

            // Convert the grouped object back to an array and sort services by name
            const sortedGroupedData = Object.values(grouped).sort((a, b) =>
                a.service_name.localeCompare(b.service_name)
            );

            setGroupedQueueData(sortedGroupedData);
        }
        
        if (error) {
            console.error("Error fetching tickets:", error);
        }
    }, [isSuccess, ticketsResponse, error]);

    // Fullscreen toggle logic
    const toggleFullscreen = () => {
        const element = kioskRef.current;
        if (!element) return;

        if (!document.fullscreenElement) {
            element.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
        } else {
            document.exitFullscreen()
                .then(() => setIsFullscreen(false));
        }
    };

    // Effect to listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Calculate dynamic grid columns based on number of services
    const gridColsClass = groupedQueueData.length > 0 ? `grid-cols-${groupedQueueData.length > 3 ? 3 : groupedQueueData.length}` : 'grid-cols-1';
    // Max number of waiting tickets to display per service before showing "+X more"
    const maxWaitingTickets = 15; // Adjusted for 14-inch, 1080p for better readability.

    return (
        <div
            className={`flex flex-col h-screen overflow-hidden ${isFullscreen ? '' : 'p-2'}`} // Remove padding in fullscreen, add it if not
            ref={kioskRef}
            style={{ backgroundColor: '#f0f4f8' }} // Light background for better contrast
        >
            {/* Header with Fullscreen Button - only visible when not in fullscreen */}
            {!isFullscreen && (
                <div className='flex w-full items-center justify-end rounded-md p-3 h-12 gap-x-4 bg-white shadow-md mb-3'>
                    <Button
                        variant="ghost"
                        className="p-2 h-7 hover:bg-gray-200"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        <Maximize className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Main Display Area - This will now handle its internal flex distribution */}
            <div className={`flex flex-col flex-grow ${isFullscreen ? '' : 'rounded-md shadow-lg'} bg-white`}>
                <div className="flex flex-col flex-grow p-6"> {/* Increased padding, flex-grow allows it to take available space */}
                    <div className="w-full max-w-8xl h-full flex flex-col flex-grow">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <h2 className="text-5xl md:text-7xl font-extrabold text-gray-800 text-center animate-pulse">
                                    Loading Queue Information...
                                </h2>
                            </div>
                        ) : groupedQueueData.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <h2 className="text-5xl md:text-7xl font-extrabold text-gray-800 text-center">
                                    No active tickets in queue. <br/> Please take a ticket.
                                </h2>
                            </div>
                        ) : (
                            // Dynamic grid for each service type
                            <div className={`grid ${gridColsClass} gap-8 auto-rows-fr h-full`}> {/* Increased gap */}
                                {groupedQueueData.map(service => (
                                    <div
                                        key={service.service_id}
                                        className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-xl p-8 flex flex-col border border-indigo-100 h-full transform transition-transform duration-500 hover:scale-[1.01]" // Enhanced styling
                                    >
                                        <h3 className="text-7xl font-extrabold text-indigo-800 mb-6 pb-4 border-b-4 border-indigo-400 text-center drop-shadow-sm">
                                            {service.service_name}
                                        </h3>

                                        {/* "Now Serving" Section */}
                                        <div className="mb-8 text-center flex-shrink-0"> {/* Use flex-shrink-0 to prevent this from shrinking */}
                                            <p className="text-3xl text-gray-700 font-semibold uppercase tracking-wider mb-4">Now Serving:</p>
                                            {Object.keys(service.currentlyCallingTicketsByCounter).length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-indigo-100">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-2xl font-bold text-indigo-700 uppercase">
                                                                    Counter
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-center text-2xl font-bold text-indigo-700 uppercase">
                                                                    Ticket No.
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {Object.entries(service.currentlyCallingTicketsByCounter)
                                                                .sort(([counterA], [counterB]) => counterA.localeCompare(counterB))
                                                                .map(([counterName, ticket]) => (
                                                                    <tr key={counterName} className="hover:bg-gray-50 transition-colors duration-200">
                                                                        <td className="px-6 py-4 whitespace-nowrap text-5xl font-extrabold text-gray-900 animate-pulse-slow">
                                                                            {counterName}
                                                                        </td>
                                                                        <td className={`px-6 py-4 whitespace-nowrap text-7xl font-extrabold text-green-600 tracking-wider`
                                                                            + (ticket.ticket_status === 50 ? ' text-3xl text-red-600 animate-pulse' : '') // Highlight assigned tickets
                                                                        }>
                                                                            {ticket.ticket_name}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-4xl text-gray-500 mt-4 font-medium">No one is currently being served</p>
                                            )}
                                        </div>

                                        {/* Total in Queue Section */}
                                        <div className="mb-8 text-left flex items-center justify-between py-2 border-t-2 border-b-2 border-gray-200 flex-shrink-0"> {/* Use flex-shrink-0 */}
                                            <p className="text-3xl text-gray-700 font-bold uppercase tracking-wider">Total Waiting:</p>
                                            <p className="text-6xl font-extrabold text-gray-900">
                                                {service.waitingTickets.length}
                                            </p>
                                        </div>

                                        {/* "Next in Queue" Section (remains service-wide) */}
                                        {/* This is the key change: max-h-full, overflow-y-auto, and flex-grow */}
                                        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                                            {service.waitingTickets.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-4"> {/* Changed to 2 columns for better readability on 14-inch */}
                                                    {service.waitingTickets.slice(0, maxWaitingTickets).map(ticket => (
                                                        <div
                                                            key={ticket.ticket_id}
                                                            className={`bg-indigo-50 rounded-lg p-3 text-center text-4xl font-bold text-indigo-700 shadow-sm transition-transform duration-200 hover:scale-105`
                                                            + (ticket.ticket_level === 2 ? ' text-violet-600' : '') // Highlight level 1 tickets
                                                            + (ticket.ticket_level === 3 ? ' text-orange-400' : '') // Highlight level 2 tickets
                                                            + (ticket.ticket_level === 4 ? ' text-red-600' : '') // Highlight level 3 tickets
                                                            }
                                                        >
                                                            {ticket.ticket_name}
                                                        </div>
                                                    ))}
                                                    {service.waitingTickets.length > maxWaitingTickets && (
                                                        <div className="col-span-full text-center text-gray-600 text-3xl font-semibold mt-4">
                                                            ( +{service.waitingTickets.length - maxWaitingTickets} more waiting )
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-500 text-3xl font-medium mt-4">No tickets currently waiting</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Note Section - This section will now stay at the bottom due to flexbox */}
                <div className="mt-auto p-6 border-t-4 border-indigo-200 text-center bg-indigo-700 text-white flex-shrink-0"> {/* flex-shrink-0 keeps it from shrinking */}
                    <p className="text-6xl text-white font-extrabold tracking-tight">
                        Pumunta po sa counter kapag tinawag ang inyong ticket.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QueueDisplay;