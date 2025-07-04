import React, { useEffect } from 'react';
import { useGetTicketsTodayByServiceIdQuery } from '@/lib/redux/api/work.api';

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
    ticket_served_datetime?: string; // Added for service time calculation
}


const Dashboard: React.FC = () => {
    const { data: ticketsResponse = { data: [] }, isLoading } = useGetTicketsTodayByServiceIdQuery(
        {
            service_id : '2ac1e6ae-821a-4591-83fe-5f8c55c7fd3d',
        },
        // {
        //     pollingInterval: 30000,
        //     skip: !workSessionDetails?.service_id,
        //     refetchOnFocus: true, // Refetch when the window is focused
        //     refetchOnReconnect: true // Refetch when the browser reconnects
        // }
    );


    /** Effect to process once tickets were fetched */
    useEffect(() => {
        console.log('useEffect 1')
        if(ticketsResponse?.data) {
            console.log('Tickets fetched:', ticketsResponse.data.length);
        }
    }, [ticketsResponse, isLoading]);

    const allTickets = ticketsResponse.data || [];

    // Filter tickets based on status to match the image
    const queuedCount = allTickets.filter((t: Ticket) => t.ticket_status === 10).length; // Assuming 10 is 'Queued'
    const assignedCount = allTickets.filter((t: Ticket) => t.ticket_status === 50).length; // Assuming 50 is 'Assigned'
    const noShowCount = allTickets.filter((t: Ticket) => t.ticket_status === 60).length; // Assuming 60 is 'No Show'
    const nowServingCount = allTickets.filter((t: Ticket) => t.ticket_status === 70).length; // Assuming 70 is 'Now Serving'
    const cancelledCount = allTickets.filter((t: Ticket) => t.ticket_status === 90).length; // Assuming 90 is 'Cancelled'
    const servedCount = allTickets.filter((t: Ticket) => t.ticket_status === 100).length; // Assuming 100 is 'Served'


    // --- Dummy Data for Averages and Processor Table (as per the image) ---
    // In a real application, these would be calculated from your fetched data.
    const avgWaitingTime = "9m 26s";
    const minWaitingTime = "5m 40s";
    const maxWaitingTime = "15m 40s";
    const totalWaitingTime = "96m 40s";

    const avgServiceTime = "13m 09s";
    const minServiceTime = "8m 34s";
    const maxServiceTime = "20m 58s";
    const totalServiceTime = "133m 40s";

    const processorData = [
        { name: "Clars Garcia", totalTickets: 30, aveService: "8m", minService: "1m 05s", maxService: "11m 23s", totalService: "245m 28s", waitingTime: "10m", idleTime: "20m", breakTime: "1h 30m", queueDepartureTime: "85m" },
        { name: "Erick Guy", totalTickets: 35, aveService: "7m 30s", minService: "53s", maxService: "9m 36s", totalService: "335m 51s", waitingTime: "4m", idleTime: "5m", breakTime: "1h 25m", queueDepartureTime: "20m" },
        { name: "Mika Manzano", totalTickets: 33, aveService: "7m 51s", minService: "59s", maxService: "10m 47s", totalService: "337m 49s", waitingTime: "7m", idleTime: "10m", breakTime: "1h 35m", queueDepartureTime: "0 m" },
        { name: "Rome", totalTickets: 33, aveService: "7m 51s", minService: "59s", maxService: "10m 47s", totalService: "337m 49s", waitingTime: "7m", idleTime: "10m", breakTime: "1h 35m", queueDepartureTime: "0 m" },
        { name: "Ejay", totalTickets: 33, aveService: "7m 51s", minService: "59s", maxService: "10m 47s", totalService: "337m 49s", waitingTime: "7m", idleTime: "10m", breakTime: "1h 35m", queueDepartureTime: "0 m" },
        { name: "Roi", totalTickets: 33, aveService: "7m 51s", minService: "59s", maxService: "10m 47s", totalService: "337m 49s", waitingTime: "7m", idleTime: "10m", breakTime: "1h 35m", queueDepartureTime: "0 m" },
        { name: "Vince", totalTickets: 33, aveService: "7m 51s", minService: "59s", maxService: "10m 47s", totalService: "337m 49s", waitingTime: "7m", idleTime: "10m", breakTime: "1h 35m", queueDepartureTime: "0 m" },
        { name: "Jeff", totalTickets: 33, aveService: "7m 51s", minService: "59s", maxService: "10m 47s", totalService: "337m 49s", waitingTime: "7m", idleTime: "10m", breakTime: "1h 35m", queueDepartureTime: "0 m" },
        { name: "Bettina", totalTickets: 33, aveService: "7m 51s", minService: "59s", maxService: "10m 47s", totalService: "337m 49s", waitingTime: "7m", idleTime: "10m", breakTime: "1h 35m", queueDepartureTime: "0 m" },
        { name: "Cleu", totalTickets: 33, aveService: "7m 51s", minService: "59s", maxService: "10m 47s", totalService: "337m 49s", waitingTime: "7m", idleTime: "10m", breakTime: "1h 35m", queueDepartureTime: "0 m" },
    ];

    return (
        <div className="grid gap-2 pl-2 pr-2">
            {/* HEADER */}
            <div className='flex justify-between items-start bg-white p-3 shadow-md mb-4'>
                <div className="text-sm font-semibold">
                    <p>Location: ZEUS</p>
                    <p>Service: POD</p>
                    <p>Date: 2025-11-06</p> {/* Hardcoded as per image */}
                </div>
                <div className="text-right text-sm font-semibold">
                    <p>Date: 2024-11-06</p> {/* Hardcoded as per image */}
                    <p>Time: 10:30:20 AM</p> {/* Hardcoded as per image */}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="h-full bg-white flex flex-col flex-grow bg-gray-100 p-4 rounded-md p-4 shadow-2xs">
                {/* Active Counters & Total Tickets */}
                <div className="flex justify-center items-center space-x-6 mb-4">
                    <div className="bg-black text-white px-8 py-4 rounded-lg shadow-md text-2xl font-bold">
                        ACTIVE COUNTERS: 4
                    </div>
                    <div className="bg-black text-white px-8 py-4 rounded-lg shadow-md text-2xl font-bold">
                        TOTAL TICKETS: 36
                    </div>
                </div>

                {/* Status Boxes */}
                <div className="grid grid-cols-6 gap-2 text-white text-center text-xl font-bold mb-6">
                    <div className="bg-gray-500 p-4">Queued <span className="block text-4xl">{queuedCount}</span></div>
                    <div className="bg-orange-600 p-4">Assigned <span className="block text-4xl">{assignedCount}</span></div>
                    <div className="bg-red-600 p-4">No Show <span className="block text-4xl">{noShowCount}</span></div>
                    <div className="bg-yellow-500 p-4">Now Serving <span className="block text-4xl">{nowServingCount}</span></div>
                    <div className="bg-red-700 p-4">Cancelled <span className="block text-4xl">{cancelledCount}</span></div>
                    <div className="bg-green-600 p-4">Served <span className="block text-4xl">{servedCount}</span></div>
                </div>

                {/* Average Times Section */}
                <div className="text-center text-sm mb-4">
                    Based on the Last 20 Transactions
                </div>
                <div className="flex justify-center space-x-8 mb-6">
                    <div className="border border-gray-300 p-4 bg-white shadow-sm flex-1 max-w-lg">
                        <p className="text-lg font-semibold text-center mb-2">Average Waiting Time</p>
                        <p className="text-4xl font-bold text-center text-blue-700 mb-4">{avgWaitingTime}</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-gray-700">
                            <div>Min <span className="block font-bold">{minWaitingTime}</span></div>
                            <div>Max <span className="block font-bold">{maxWaitingTime}</span></div>
                            <div>Total <span className="block font-bold">{totalWaitingTime}</span></div>
                        </div>
                    </div>
                    <div className="border border-gray-300 p-4 bg-white shadow-sm flex-1 max-w-lg">
                        <p className="text-lg font-semibold text-center mb-2">Average Service Time</p>
                        <p className="text-4xl font-bold text-center text-blue-700 mb-4">{avgServiceTime}</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-gray-700">
                            <div>Min <span className="block font-bold">{minServiceTime}</span></div>
                            <div>Max <span className="block font-bold">{maxServiceTime}</span></div>
                            <div>Total <span className="block font-bold">{totalServiceTime}</span></div>
                        </div>
                    </div>
                </div>

                {/* Processor Table */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className='bg-gray-200 text-gray-700 border border-gray-300'>
                            <tr className="bg-gray-200 text-gray-700 border-gray-300 text-left text-sm font-semibold uppercase tracking-wider">
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center">Processor</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center">Total Tickets Processed</th>
                                <th colSpan={4} className="px-3 py-2 border-b border-r border-gray-300 text-center">Service Time</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center">Waiting Time</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center">Idle Time</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center">Break Time</th>
                                <th rowSpan={2} className="px-3 py-2 text-center">Queue Departure Time</th>
                            </tr>
                            <tr className="bg-gray-200 text-gray-700 text-left text-xs font-semibold uppercase tracking-wider">
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Ave</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Min</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Max</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {processorData.map((processor, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-3 py-2 whitespace-nowrap text-center font-medium">{processor.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.totalTickets}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.aveService}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.minService}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.maxService}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.totalService}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.waitingTime}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.idleTime}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.breakTime}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.queueDepartureTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;