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
    ticket_create_datetime: string; // Timestamp when the ticket was created, useful for sorting waiting queue
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
            pollingInterval: 60000 // Poll every 60 seconds for real-time updates
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
                        currentlyCallingTicketsByCounter: {}, // Initialize the map for counters
                        waitingTickets: []
                    };
                }

                // Assign tickets to 'calling' or 'waiting' lists
                if(ticket.ticket_status > 10) { // Assuming '10' means waiting
                    // Ensure ticket_counter exists for calling tickets
                    console.log("Processing ticket:", ticket);
                    if(ticket.ticket_counter) {
                        // In case multiple calling tickets for the same counter exist (shouldn't happen in a real system)
                        // This will pick the latest one based on array order. For robustness, you might want to sort by ticket_create_datetime.
                        grouped[ticket.service_id].currentlyCallingTicketsByCounter[ticket.ticket_counter] = ticket;
                    }
                } else {
                    grouped[ticket.service_id].waitingTickets.push(ticket);
                }
            });

            // Sort waiting tickets for each service by creation time
            Object.values(grouped).forEach(service => {
                service.waitingTickets.sort((a, b) =>
                    new Date(a.ticket_create_datetime).getTime() - new Date(b.ticket_create_datetime).getTime()
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

    return (
        // The main container that will go fullscreen.
        // We set it to flex column and flex-grow to make its content fill it.
        <div
            className={`flex flex-col gap-3 pl-2 pr-2 ${isFullscreen ? 'h-screen' : ''}`}
            ref={kioskRef}
        >
            {/* Header with Fullscreen Button */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
                <Button
                    variant="ghost"
                    className="p-2 h-7 hover:bg-gray-400"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    <Maximize className="h-4 w-4" />
                </Button>
            </div>

            {/* Main Display Area - This now needs to flex-grow to fill the remaining space */}
            <div className={`rounded-xs bg-gray-50 shadow-2xs p-4 flex flex-col flex-grow`}>
                {/* This flex-grow div will contain the service grid and expand to fill available space */}
                <div className="flex flex-col items-center justify-center flex-grow p-4 max-h-[calc(100%-140px)]">
                    {/* This div should also flex-grow to ensure its grid content fills the height */}
                    <div className="w-full max-w-8xl h-full flex flex-col flex-grow">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full p-5">
                                <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-800 text-center">
                                    Loading tickets...
                                </h2>
                            </div>
                        ) : groupedQueueData.length === 0 ? (
                            <div className="flex justify-center items-center h-full p-5">
                                <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-800 text-center">
                                    No active tickets in queue.
                                </h2>
                            </div>
                        ) : (
                            // Dynamic grid for each service type - ensure this grid grows to fill space
                            <div className={`grid grid-cols-1 gap-6 auto-rows-fr h-full grid-cols-${groupedQueueData.length}`}>
                                {groupedQueueData.map(service => (
                                    <div
                                        key={service.service_id}
                                        className="bg-white rounded-lg shadow-md p-6 flex flex-col border border-gray-200 h-full transition-all duration-300 hover:shadow-lg"
                                    >
                                        <h3 className="text-7xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-indigo-500 text-center">
                                            {service.service_name}
                                        </h3>

                                        {/* "Now Serving" Section - now dynamic for multiple counters in a table */}
                                        <div className="mb-6 text-center">
                                            {/* <p className="text-sm text-gray-600 font-medium uppercase tracking-wider mb-2">Now Serving</p> */}
                                            {Object.keys(service.currentlyCallingTicketsByCounter).length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-lg font-bold text-gray-500 uppercase tracking-wider">
                                                                    Counter
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-center text-lg font-bold text-gray-500 uppercase tracking-wider">
                                                                    Now Serving
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {Object.entries(service.currentlyCallingTicketsByCounter)
                                                                .sort(([counterA], [counterB]) => counterA.localeCompare(counterB))
                                                                .map(([counterName, ticket]) => (
                                                                    <tr key={counterName}>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-3xl font-bold text-gray-700">
                                                                            {counterName}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-5xl font-extrabold text-indigo-700 tracking-wider animate-bounce-slow">
                                                                            {ticket.ticket_name}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-xl text-gray-500 mt-2">No one is currently being served</p>
                                            )}
                                        </div>

                                        {/* Total in Queue Section */}
                                        <div className="mb-4 text-left flex flex-row items-center gap-x-2">
                                            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Total in Queue:</p>
                                            <p className="text-2xl font-bold text-gray-800">
                                                {service.waitingTickets.length}
                                            </p>
                                        </div>

                                        {/* "Next in Queue" Section (remains service-wide) */}
                                        <div className="overflow-y-auto max-h-[calc(85%-100px)] no-scrollbar">
                                                {service.waitingTickets.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {service.waitingTickets.slice(0, 27).map(ticket => (
                                                        <div
                                                            key={ticket.ticket_id}
                                                            className="bg-gray-100 rounded-md p-2 text-center text-3xl font-bold text-gray-700 shadow-sm hover:bg-gray-200 transition-colors"
                                                        >
                                                            {ticket.ticket_name}
                                                        </div>
                                                    ))}
                                                    {service.waitingTickets.length > 27 && (
                                                        <div className="col-span-full text-center text-gray-500 text-base mt-2">
                                                            ( +{service.waitingTickets.length - 27} more waiting)
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-500 text-base mt-2">No tickets waiting</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* Footer Note Section */
                isLoading ? groupedQueueData.length > 0 :
                <div className="m-4 p-4 border-t tracking-wider border-gray-200 text-center">
                    <p className="text-5xl text-gray-800 font-bold">
                        Pumunta po sa counter kapag tinawag ang inyong ticket.
                    </p>
                </div>
                }
            </div>
        </div>
    );
};

export default QueueDisplay;