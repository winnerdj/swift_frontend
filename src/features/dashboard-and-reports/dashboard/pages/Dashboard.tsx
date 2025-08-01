import useDisclosure from '@/hooks/useDisclosure';
import {
    useGetTicketsTodayByServiceIdQuery,
    useGetActiveCountersTodayByServiceIdQuery,
    useGetUserActivityTodayByServiceIdQuery
} from '@/lib/redux/api/work.api';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from "@/hooks/redux.hooks";
import { getDashboardState } from "@/lib/redux/slices/dashboard.slice";
import { Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SelectServiceDialog from '../components/modals/SelectServiceDialog';

// Define the Ticket interface based on the provided example data structure
interface Ticket {
    ticket_id: string;
    ticket_service: string;
    ticket_status: number;
    ticket_level: number;
    ticket_parent_reference: string | null;
    ticket_head_reference: string | null;
    ticket_counter: string | null;
    ticket_support: string | null;
    ticket_create_datetime: string;
    ticket_queue_datetime: string;
    ticket_assigned_datetime: string | null;
    ticket_now_serving_datetime: string | null;
    ticket_served_datetime: string | null;
    ticket_no_show_datetime: string | null;
    ticket_cancelled_datetime: string | null;
    ticket_reason_code: string | null;
    ticket_trip_number: string;
    ticket_trucker_id: string | null;
    ticket_trucker_name: string | null;
    ticket_vehicle_type: string;
    ticket_plate_num: string;
    ticket_remarks1: string | null;
    ticket_remarks2: string | null;
    ticket_remarks3: string | null;
    ticket_override: number;
    createdBy: string | null;
    createdAt: string;
    updatedBy: string | null;
    updatedAt: string;
    // Optional fields that were in the original interface but not in the example JSON
    ticket_number?: string;
    service_name?: string;
    service_location?: string;
}

// Define the UserActivity interface
interface UserActivity {
    log_id: string;
    user_id: string;
    activity: string;
    location: string;
    service_id: string;
    counter: string;
    user_status: string;
    reason_code: string | null;
    start_datetime: string;
    duration: number; // Duration in seconds
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

// Define the interface for the calculated processor statistics
interface ProcessorStats {
    name: string;
    totalTickets: number;
    aveService: string;
    minService: string;
    maxService: string;
    totalService: string;
    clientWaitingTime: string; // Renamed from waitingTime to clientWaitingTime
    agentWaitingTime: string; // New field for agent waiting time (Average)
    totalAgentWaitingTime: string; // New field for total agent waiting time
    idleTime: string;
    breakTime: string;
    totalLoggedInTime: string; // Changed from queueDepartureTime to totalLoggedInTime
}

/**
 * Helper function to parse datetime strings (e.g., "2025-07-03 10:00:40.000000")
 * into Date objects. Handles null input.
 * @param datetimeString The date-time string to parse.
 * @returns A Date object or null if the input is null or invalid.
 */
const parseDateTime = (datetimeString: string | null): Date | null => {
    if (!datetimeString) return null;
    // Replace space with 'T' for proper ISO 8601 parsing, and strip milliseconds for broader compatibility
    const isoString = datetimeString.replace(' ', 'T').split('.')[0];
    const date = new Date(isoString);
    // Check if the parsed date is valid
    return isNaN(date.getTime()) ? null : date;
};

/**
 * Helper function to format a duration in milliseconds into a human-readable string
 * (e.g., "1h 30m 5s", "8m 23s", "0s").
 * @param milliseconds The duration in milliseconds.
 * @returns A formatted string representing the duration, or "N/A" if invalid.
 */
const formatDuration = (milliseconds: number | null): string => {
    if (milliseconds === null || isNaN(milliseconds) || milliseconds < 0) {
        return "N/A";
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let parts = [];
    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    // Include minutes if there are any, or if no hours and there are seconds (e.g., "0h 5m 10s" -> "5m 10s")
    if (minutes > 0 || (hours === 0 && seconds > 0)) {
        parts.push(`${minutes}m`);
    }
    // Include seconds if there are any, or if the total duration is 0 (to show "0s")
    if (seconds > 0 || (hours === 0 && minutes === 0 && seconds === 0)) {
        parts.push(`${seconds}s`);
    }

    if (parts.length === 0) {
        return "0s"; // Fallback for edge cases where duration is truly zero but not caught above
    }
    return parts.join(' ');
};

const Dashboard: React.FC = () => {
    const dashboardDisclosure = useDisclosure();

    // Get the selected service ID and location from Redux
    const dashboardState = useAppSelector(getDashboardState);
    const { service_id, service_location, service_name } = dashboardState;

    // Fetch ticket data using the provided Redux Toolkit Query hook
    const { data: ticketsResponse = { data: [] }, isLoading: ticketsIsLoading } = useGetTicketsTodayByServiceIdQuery(
        {
            service_id: service_id || '',
        },
        {
            skip: !service_id,
            refetchOnMountOrArgChange: true,
            pollingInterval: 5000,
            skipPollingIfUnfocused: true
        }
    );

    // Fetch active counters using the provided Redux Toolkit Query hook
    const { data: countersResponse = { data: [] }, isLoading: countersIsLoading } = useGetActiveCountersTodayByServiceIdQuery(
        {
            service_id: service_id || '',
        },
        {
            skip: !service_id,
            refetchOnMountOrArgChange: true,
            pollingInterval: 5000,
            skipPollingIfUnfocused: true
        }
    );

    // Fetch user activity to align with the existing work session data
    const { data: userActivityResponse = { data: [] }, isLoading: userActivityIsLoading } = useGetUserActivityTodayByServiceIdQuery(
        {
            service_id: service_id || '',
        },
        {
            skip: !service_id,
            refetchOnMountOrArgChange: true,
            pollingInterval: 5000,
            skipPollingIfUnfocused: true
        }
    );

    // State to hold the dynamically calculated processor data
    const [calculatedProcessorData, setCalculatedProcessorData] = useState<ProcessorStats[]>([]);
    const [activeCounters, setActiveCounters] = useState<number>(0);

    useEffect(() => {
        if (ticketsResponse?.data.length > 0 || userActivityResponse?.data.length > 0) {
            const allTickets: Ticket[] = ticketsResponse.data;
            const allUserActivities: UserActivity[] = userActivityResponse.data;

            // Filter out tickets that are 'Unassigned' before processing
            const assignedTickets = allTickets.filter(ticket => ticket.ticket_support !== null && ticket.ticket_support !== undefined && ticket.ticket_support !== '');

            const processorsMap: {
                [key: string]: {
                    totalTickets: number;
                    serviceDurations: number[]; // Stores durations in milliseconds for active service (now serving to served/cancelled/no-show)
                    clientWaitingDurations: number[]; // Stores durations in milliseconds for client
                    agentWaitingDurations: number[]; // Stores durations in milliseconds for agent (assigned to now serving / no show / cancelled)
                    totalBreakTime: number; // New field for total break time in milliseconds
                    loggedInStart: Date | null; // Stores the start time of the logged-in session
                    loggedInEnd: Date | null; // Stores the end time of the logged-in session
                    busyTime: number; // sum of service time and agent waiting time
                };
            } = {};

            // Initialize processorsMap with user IDs from user activities
            allUserActivities.forEach(activity => {
                const userId = activity.user_id;
                if (!processorsMap[userId]) {
                    processorsMap[userId] = {
                        totalTickets: 0,
                        serviceDurations: [],
                        clientWaitingDurations: [],
                        agentWaitingDurations: [],
                        totalBreakTime: 0,
                        loggedInStart: null,
                        loggedInEnd: null,
                        busyTime: 0
                    };
                }

                const activityStartTime = parseDateTime(activity.start_datetime);
                const activityEndTime = parseDateTime(activity.updatedAt);

                // Determine the earliest login time
                if (activity.activity === "Queue Login" && activityStartTime) {
                    if (!processorsMap[userId].loggedInStart || (processorsMap[userId].loggedInStart && activityStartTime.getTime() < processorsMap[userId].loggedInStart.getTime())) {
                        processorsMap[userId].loggedInStart = activityStartTime;
                    }
                }

                // Determine the latest activity end time
                if (activityEndTime) {
                    if (!processorsMap[userId].loggedInEnd || (processorsMap[userId].loggedInEnd && activityEndTime.getTime() > processorsMap[userId].loggedInEnd.getTime())) {
                        processorsMap[userId].loggedInEnd = activityEndTime;
                    }
                }

                // Calculate Break Time from user activities
                if (activity.activity === "Queue Breaktime" && activity.duration !== null) {
                    processorsMap[userId].totalBreakTime += (activity.duration * 1000); // Convert seconds to milliseconds
                }
            });


            // Iterate only over assigned tickets to calculate service and agent waiting times
            assignedTickets.forEach((ticket) => {
                const processorId = ticket.ticket_support!; // We know it's not null/undefined here

                // Ensure processorId exists in processorsMap (it should if they had activities)
                if (!processorsMap[processorId]) {
                    processorsMap[processorId] = {
                        totalTickets: 0,
                        serviceDurations: [],
                        clientWaitingDurations: [],
                        agentWaitingDurations: [],
                        totalBreakTime: 0,
                        loggedInStart: null,
                        loggedInEnd: null,
                        busyTime: 0
                    };
                }

                processorsMap[processorId].totalTickets++;

                const createTime = parseDateTime(ticket.ticket_create_datetime);
                const assignedTime = parseDateTime(ticket.ticket_assigned_datetime);
                const nowServingTime = parseDateTime(ticket.ticket_now_serving_datetime);
                const servedTime = parseDateTime(ticket.ticket_served_datetime);
                const noShowTime = parseDateTime(ticket.ticket_no_show_datetime);
                const cancelledTime = parseDateTime(ticket.ticket_cancelled_datetime);


                // Calculate Client Waiting Time (ticket_create_datetime to ticket_assigned_datetime)
                if (createTime && assignedTime) {
                    const clientWaitingTime = assignedTime.getTime() - createTime.getTime();
                    if (clientWaitingTime >= 0) {
                        processorsMap[processorId].clientWaitingDurations.push(clientWaitingTime);
                    }
                }

                // Calculate Agent Waiting Time (assigned_datetime to now_serving_datetime OR (no_show/cancelled if no now_serving))
                // This is the time the agent is "holding" the ticket before actively serving or before it's resolved without serving.
                if (assignedTime) {
                    let agentWaitingEnd: Date | null = null;
                    if (nowServingTime) {
                        agentWaitingEnd = nowServingTime;
                    } else if (noShowTime) {
                        agentWaitingEnd = noShowTime;
                    } else if (cancelledTime) {
                        agentWaitingEnd = cancelledTime;
                    }

                    if (agentWaitingEnd && agentWaitingEnd.getTime() >= assignedTime.getTime()) {
                        const agentWaitingTime = agentWaitingEnd.getTime() - assignedTime.getTime();
                        if (agentWaitingTime >= 0) {
                            processorsMap[processorId].agentWaitingDurations.push(agentWaitingTime);
                            processorsMap[processorId].busyTime += agentWaitingTime; // Add to busy time
                        }
                    }
                }

                // Calculate Service Time (now_serving_datetime to served/no_show/cancelled_datetime)
                // This now includes time spent on cancelled/no-show tickets IF they reached "Now Serving"
                if (nowServingTime) {
                    let serviceEnd: Date | null = null;

                    // Determine the end of service in order of preference/logic
                    if (servedTime) {
                        serviceEnd = servedTime;
                    } else {
                        // If not served, consider no-show or cancelled if they happened AFTER nowServingTime
                        if (noShowTime && noShowTime.getTime() >= nowServingTime.getTime()) {
                            serviceEnd = noShowTime;
                        }
                        if (cancelledTime && cancelledTime.getTime() >= nowServingTime.getTime()) {
                            // Take the earliest of noShowTime and cancelledTime if both exist and are after nowServingTime
                            if (!serviceEnd || cancelledTime.getTime() < serviceEnd.getTime()) {
                                serviceEnd = cancelledTime;
                            }
                        }
                    }

                    if (serviceEnd && serviceEnd.getTime() >= nowServingTime.getTime()) {
                        const serviceDuration = serviceEnd.getTime() - nowServingTime.getTime();
                        if (serviceDuration >= 0) {
                            processorsMap[processorId].serviceDurations.push(serviceDuration);
                            processorsMap[processorId].busyTime += serviceDuration; // Add to busy time
                        }
                    }
                }
            });

            const newProcessorData: ProcessorStats[] = Object.keys(processorsMap).map((processorId) => {
                const stats = processorsMap[processorId];

                const totalServiceMs = stats.serviceDurations.reduce((sum, d) => sum + d, 0);
                const aveServiceMs = stats.serviceDurations.length > 0 ? totalServiceMs / stats.serviceDurations.length : 0;
                const minServiceMs = stats.serviceDurations.length > 0 ? Math.min(...stats.serviceDurations) : 0;
                const maxServiceMs = stats.serviceDurations.length > 0 ? Math.max(...stats.serviceDurations) : 0;

                const totalClientWaitingMs = stats.clientWaitingDurations.reduce((sum, d) => sum + d, 0);
                const aveClientWaitingMs = stats.clientWaitingDurations.length > 0 ? totalClientWaitingMs / stats.clientWaitingDurations.length : 0;

                const totalAgentWaitingMs = stats.agentWaitingDurations.reduce((sum, d) => sum + d, 0);
                const aveAgentWaitingMs = stats.agentWaitingDurations.length > 0 ? totalAgentWaitingMs / stats.agentWaitingDurations.length : 0;

                // Calculate Total Logged In Time
                let totalLoggedInDuration = 0;
                if (stats.loggedInStart && stats.loggedInEnd) {
                    totalLoggedInDuration = stats.loggedInEnd.getTime() - stats.loggedInStart.getTime();
                }

                // Calculate Idle Time
                // Total Logged In Time - Total Break Time - Total Busy Time
                // Ensure idle time is not negative
                const idleTimeMs = Math.max(0, totalLoggedInDuration - stats.totalBreakTime - stats.busyTime);


                return {
                    name: processorId,
                    totalTickets: stats.totalTickets,
                    aveService: formatDuration(aveServiceMs),
                    minService: formatDuration(minServiceMs),
                    maxService: formatDuration(maxServiceMs),
                    totalService: formatDuration(totalServiceMs),
                    clientWaitingTime: formatDuration(aveClientWaitingMs),
                    agentWaitingTime: formatDuration(aveAgentWaitingMs),
                    totalAgentWaitingTime: formatDuration(totalAgentWaitingMs),
                    idleTime: formatDuration(idleTimeMs),
                    breakTime: formatDuration(stats.totalBreakTime),
                    totalLoggedInTime: formatDuration(totalLoggedInDuration),
                };
            });

            setCalculatedProcessorData(newProcessorData);
        }

        if (countersResponse?.data.length > 0) {
            setActiveCounters(countersResponse?.data.length);
        }
    }, [ticketsResponse, ticketsIsLoading, countersResponse, countersIsLoading, userActivityResponse, userActivityIsLoading]);

    // Get all tickets from the response, defaulting to an empty array if undefined
    const allTickets: Ticket[] = ticketsResponse.data || [];

    // Filter tickets by status to get counts for the status boxes
    const queuedCount = allTickets.filter((t: Ticket) => t.ticket_status === 10).length;
    const assignedCount = allTickets.filter((t: Ticket) => t.ticket_status === 50).length;
    const noShowCount = allTickets.filter((t: Ticket) => t.ticket_status === 60).length;
    const nowServingCount = allTickets.filter((t: Ticket) => t.ticket_status === 70).length;
    const cancelledCount = allTickets.filter((t: Ticket) => t.ticket_status === 90).length;
    const servedCount = allTickets.filter((t: Ticket) => t.ticket_status === 100).length;

    // --- Calculate Overall Average Waiting and Service Times ---
    // Filter for tickets that have a 'now serving' timestamp to calculate service times
    const ticketsWithNowServing = allTickets.filter((t: Ticket) => t.ticket_now_serving_datetime);

    // Filter for tickets that have enough data to calculate client waiting times
    const clientWaitingTickets = allTickets.filter((t: Ticket) =>
        t.ticket_create_datetime && t.ticket_assigned_datetime
    );

    // Filter for tickets that have enough data to calculate agent waiting times
    const agentWaitingTickets = allTickets.filter((t: Ticket) =>
        t.ticket_assigned_datetime && (t.ticket_now_serving_datetime || t.ticket_no_show_datetime || t.ticket_cancelled_datetime)
    );

    let allServiceDurations: number[] = [];
    ticketsWithNowServing.forEach(ticket => {
        const nowServingTime = parseDateTime(ticket.ticket_now_serving_datetime);
        const servedTime = parseDateTime(ticket.ticket_served_datetime);
        const noShowTime = parseDateTime(ticket.ticket_no_show_datetime);
        const cancelledTime = parseDateTime(ticket.ticket_cancelled_datetime);

        if (nowServingTime) {
            let serviceEnd: Date | null = null;
            if (servedTime) {
                serviceEnd = servedTime;
            } else {
                if (noShowTime && noShowTime.getTime() >= nowServingTime.getTime()) {
                    serviceEnd = noShowTime;
                }
                if (cancelledTime && cancelledTime.getTime() >= nowServingTime.getTime()) {
                    if (!serviceEnd || cancelledTime.getTime() < serviceEnd.getTime()) {
                        serviceEnd = cancelledTime;
                    }
                }
            }

            if (serviceEnd && serviceEnd.getTime() >= nowServingTime.getTime()) {
                const duration = serviceEnd.getTime() - nowServingTime.getTime();
                if (duration >= 0) allServiceDurations.push(duration);
            }
        }
    });

    let allClientWaitingDurations: number[] = [];
    clientWaitingTickets.forEach(ticket => {
        const createTime = parseDateTime(ticket.ticket_create_datetime);
        const assignedTime = parseDateTime(ticket.ticket_assigned_datetime);
        if (createTime && assignedTime) {
            const duration = assignedTime.getTime() - createTime.getTime();
            if (duration >= 0) allClientWaitingDurations.push(duration);
        }
    });

    let allAgentWaitingDurations: number[] = [];
    agentWaitingTickets.forEach(ticket => {
        const assignedTime = parseDateTime(ticket.ticket_assigned_datetime);
        const firstActionTime =
            parseDateTime(ticket.ticket_now_serving_datetime) ||
            parseDateTime(ticket.ticket_no_show_datetime) ||
            parseDateTime(ticket.ticket_cancelled_datetime);

        if (assignedTime && firstActionTime) {
            const duration = firstActionTime.getTime() - assignedTime.getTime();
            if (duration >= 0) allAgentWaitingDurations.push(duration);
        }
    });

    // Calculate statistics for overall client waiting time
    const totalAvgClientWaitingTimeMs = allClientWaitingDurations.reduce((sum, d) => sum + d, 0);
    const avgClientWaitingTime = formatDuration(allClientWaitingDurations.length > 0 ? totalAvgClientWaitingTimeMs / allClientWaitingDurations.length : 0);
    const minClientWaitingTime = formatDuration(allClientWaitingDurations.length > 0 ? Math.min(...allClientWaitingDurations) : 0);
    const maxClientWaitingTime = formatDuration(allClientWaitingDurations.length > 0 ? Math.max(...allClientWaitingDurations) : 0);
    const totalClientWaitingTime = formatDuration(totalAvgClientWaitingTimeMs);

    // Calculate statistics for overall agent waiting time
    const totalAvgAgentWaitingTimeMs = allAgentWaitingDurations.reduce((sum, d) => sum + d, 0);
    const avgAgentWaitingTime = formatDuration(allAgentWaitingDurations.length > 0 ? totalAvgAgentWaitingTimeMs / allAgentWaitingDurations.length : 0);
    const minAgentWaitingTime = formatDuration(allAgentWaitingDurations.length > 0 ? Math.min(...allAgentWaitingDurations) : 0);
    const maxAgentWaitingTime = formatDuration(allAgentWaitingDurations.length > 0 ? Math.max(...allAgentWaitingDurations) : 0);
    const totalAgentWaitingTime = formatDuration(totalAvgAgentWaitingTimeMs);

    // Calculate statistics for overall service time
    const totalAvgServiceTimeMs = allServiceDurations.reduce((sum, d) => sum + d, 0);
    const avgServiceTime = formatDuration(allServiceDurations.length > 0 ? totalAvgServiceTimeMs / allServiceDurations.length : 0);
    const minServiceTime = formatDuration(allServiceDurations.length > 0 ? Math.min(...allServiceDurations) : 0);
    const maxServiceTime = formatDuration(allServiceDurations.length > 0 ? Math.max(...allServiceDurations) : 0);
    const totalServiceTime = formatDuration(totalAvgServiceTimeMs);

    return (
        <div className="grid gap-2 pl-2 pr-2 font-sans">
            {/* HEADER */}
            <div className='flex justify-between items-start bg-white p-3 shadow-md mb-4 rounded-md'>
                <div className="text-sm font-semibold">
                    <p>Location: {service_location ? service_location.toUpperCase() : 'N/A'}</p>
                    <p>Service: {service_name ? service_name.toUpperCase() : 'N/A'}</p>
                </div>
                <div className="text-right text-sm font-semibold self-center">
                    <Button variant={'ghost'} className='p-3 h-7 hover:bg-gray-400 gap-1.5 border border-gray-300' onClick={() => dashboardDisclosure.onOpen('selectService')}>
                        <Gauge />
                        Change Service
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="h-full flex flex-col flex-grow bg-gray-100 p-4 rounded-md shadow-2xs">
                {/* Active Counters & Total Tickets */}
                <div className="flex justify-center items-center space-x-6 mb-4">
                    <div className="bg-black text-white px-8 py-4 rounded-lg shadow-md text-2xl font-bold">
                        ACTIVE COUNTERS: {activeCounters}
                    </div>
                    <div className="bg-black text-white px-8 py-4 rounded-lg shadow-md text-2xl font-bold">
                        TOTAL TICKETS: {allTickets.length}
                    </div>
                </div>

                {/* Status Boxes - Counts are now dynamically calculated */}
                <div className="grid grid-cols-6 gap-2 text-white text-center text-xl font-bold mb-6">
                    <div className="bg-gray-500 p-4 rounded-md">Queued <span className="block text-4xl">{queuedCount}</span></div>
                    <div className="bg-orange-600 p-4 rounded-md">Assigned <span className="block text-4xl">{assignedCount}</span></div>
                    <div className="bg-red-600 p-4 rounded-md">No Show <span className="block text-4xl">{noShowCount}</span></div>
                    <div className="bg-yellow-500 p-4 rounded-md">Now Serving <span className="block text-4xl">{nowServingCount}</span></div>
                    <div className="bg-red-700 p-4 rounded-md">Cancelled <span className="block text-4xl">{cancelledCount}</span></div>
                    <div className="bg-green-600 p-4 rounded-md">Served <span className="block text-4xl">{servedCount}</span></div>
                </div>

                {/* Average Times Section - Now dynamically calculated */}
                <div className="text-center text-sm mb-4">
                    Based on today's transactions
                </div>
                <div className="flex justify-center space-x-8 mb-6">
                    <div className="border border-gray-300 p-4 bg-white shadow-sm flex-1 max-w-lg rounded-md">
                        <p className="text-lg font-semibold text-center mb-2">Average Client Waiting Time</p>
                        <p className="text-4xl font-bold text-center text-blue-700 mb-4">{avgClientWaitingTime}</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-gray-700">
                            <div>Min <span className="block font-bold">{minClientWaitingTime}</span></div>
                            <div>Max <span className="block font-bold">{maxClientWaitingTime}</span></div>
                            <div>Total <span className="block font-bold">{totalClientWaitingTime}</span></div>
                        </div>
                    </div>
                    <div className="border border-gray-300 p-4 bg-white shadow-sm flex-1 max-w-lg rounded-md">
                        <p className="text-lg font-semibold text-center mb-2">Average Agent Waiting Time</p>
                        <p className="text-4xl font-bold text-center text-blue-700 mb-4">{avgAgentWaitingTime}</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-gray-700">
                            <div>Min <span className="block font-bold">{minAgentWaitingTime}</span></div>
                            <div>Max <span className="block font-bold">{maxAgentWaitingTime}</span></div>
                            <div>Total <span className="block font-bold">{totalAgentWaitingTime}</span></div>
                        </div>
                    </div>
                    <div className="border border-gray-300 p-4 bg-white shadow-sm flex-1 max-w-lg rounded-md">
                        <p className="text-lg font-semibold text-center mb-2">Average Service Time</p>
                        <p className="text-4xl font-bold text-center text-blue-700 mb-4">{avgServiceTime}</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-gray-700">
                            <div>Min <span className="block font-bold">{minServiceTime}</span></div>
                            <div>Max <span className="block font-bold">{maxServiceTime}</span></div>
                            <div>Total <span className="block font-bold">{totalServiceTime}</span></div>
                        </div>
                    </div>
                </div>

                {/* Processor Table - Now uses dynamically calculated data */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className='bg-gray-200 text-gray-700 border border-gray-300'>
                            <tr className="bg-gray-200 text-gray-700 border-gray-300 text-left text-sm font-semibold uppercase tracking-wider">
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center rounded-tl-md">Processor</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center">Total Tickets Processed</th>
                                <th colSpan={2} className="px-3 py-2 border-b border-r border-gray-300 text-center">Waiting Time</th>
                                <th colSpan={4} className="px-3 py-2 border-b border-r border-gray-300 text-center">Service Time</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center">Idle Time</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-center">Break Time</th>
                                <th rowSpan={2} className="px-3 py-2 text-center rounded-tr-md">Total Logged in Time</th>
                            </tr>
                            <tr className="bg-gray-200 text-gray-700 text-left text-xs font-semibold uppercase tracking-wider">
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Agent Ave</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Agent Total</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Ave</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Min</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Max</th>
                                <th className="px-3 py-2 border-r border-gray-300 text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {/* Render rows using the dynamically calculated processor data */}
                            {calculatedProcessorData.map((processor, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-3 py-2 whitespace-nowrap text-center font-medium">{processor.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.totalTickets}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.agentWaitingTime}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.totalAgentWaitingTime}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.aveService}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.minService}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.maxService}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.totalService}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.idleTime}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.breakTime}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">{processor.totalLoggedInTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <SelectServiceDialog isOpen={dashboardDisclosure.isOpen('selectService')} onClose={() => dashboardDisclosure.onClose('selectService')} />
        </div>
    );
};

export default Dashboard;