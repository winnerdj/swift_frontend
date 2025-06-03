import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';

type ticketTableType = {
    ticket_id: string;
    ticket_service: string;
    ticket_status: number;
    ticket_level: number;
    ticket_parent_reference: string;
    ticket_head_reference: string;
    ticket_counter: string;
    ticket_support: string;
    ticket_create_datetime: string;
    ticket_queue_datetime: string;
    ticket_assigned_datetime: string;
    ticket_now_serving_datetime: string;
    ticket_served_datetime: string;
    ticket_no_show_datetime: string;
    ticket_cancelled_datetime: string;
    ticket_reason_code: string;
    ticket_trip_number: string;
    ticket_trucker_id: string;
    ticket_trucker_name: string;
    ticket_vehicle_type: string;
    ticket_plate_num: string;
    ticket_remarks1: string;
    ticket_remarks2: string;
    ticket_remarks3: string;
    createdBy: string;
    updatedBy: string;
    qc_service_location_desc?: string;
    qc_service_location?: string;
    service_location?: string;
    qc_service_discipline?: string;
    qc_service_discipline_desc?: string;
    service_discipline?: string;
    service_name?: string;
    service_description?: string;
    no_of_counters?: string;
    counter_prefix?: string;
    ticket_number_prefix?: string;
    recall_waiting_flag?: boolean;
    recall_waiting_time?: number;
}

interface TicketDetailsProps {
    onClose: () => void;
    isOpen: boolean;
    selectedTicket: ticketTableType | null;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ onClose, isOpen, selectedTicket }) => {
    const formatDateTime = (datetimeString?: string) => {
        if (!datetimeString) return 'N/A';
        try {
            const date = new Date(datetimeString);
            return date.toLocaleString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
        } catch (e) {
            console.error("Error formatting date:", datetimeString, e);
            return datetimeString;
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogPanel className="md:max-w-5xl w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Ticket Details</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto max-h-[80vh]"> {/* Added max-h and overflow-y-auto */}
                        {selectedTicket ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6'>
                                {/* Row 1 */}
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Ticket ID:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Service:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_service || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Status:</p>
                                    <p className="text-lg font-bold">
                                        {selectedTicket.ticket_status === 1 ? 'Active' : 'Inactive'}
                                    </p>
                                </div>

                                {/* Row 2 */}
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Level:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_level || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Parent Reference:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_parent_reference || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Head Reference:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_head_reference || 'N/A'}</p>
                                </div>

                                {/* Row 3 */}
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Counter:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_counter || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Support:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_support || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Trip Number:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_trip_number || 'N/A'}</p>
                                </div>

                                {/* Row 4 */}
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Trucker ID:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_trucker_id || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Trucker Name:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_trucker_name || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Vehicle Type:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_vehicle_type || 'N/A'}</p>
                                </div>

                                {/* Row 5 */}
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Plate Number:</p>
                                    <p className="text-lg font-bold">{selectedTicket.ticket_plate_num || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Recall Waiting Flag:</p>
                                    <p className="text-lg font-bold">
                                        {selectedTicket.recall_waiting_flag ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Recall Waiting Time (mins):</p>
                                    <p className="text-lg font-bold">{selectedTicket.recall_waiting_time ?? 'N/A'}</p>
                                </div>

                                {/* Remarks Sections (full width) */}
                                <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
                                    <p className="text-sm font-semibold text-gray-500">Remarks 1:</p>
                                    <p className="text-base break-words">{selectedTicket.ticket_remarks1 || 'N/A'}</p>
                                </div>
                                <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
                                    <p className="text-sm font-semibold text-gray-500">Remarks 2:</p>
                                    <p className="text-base break-words">{selectedTicket.ticket_remarks2 || 'N/A'}</p>
                                </div>
                                <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
                                    <p className="text-sm font-semibold text-gray-500">Remarks 3:</p>
                                    <p className="text-base break-words">{selectedTicket.ticket_remarks3 || 'N/A'}</p>
                                </div>

                                {/* Timestamps */}
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Created On:</p>
                                    <p className="text-base">{formatDateTime(selectedTicket.ticket_create_datetime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Queued On:</p>
                                    <p className="text-base">{formatDateTime(selectedTicket.ticket_queue_datetime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Assigned On:</p>
                                    <p className="text-base">{formatDateTime(selectedTicket.ticket_assigned_datetime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Now Serving On:</p>
                                    <p className="text-base">{formatDateTime(selectedTicket.ticket_now_serving_datetime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Served On:</p>
                                    <p className="text-base">{formatDateTime(selectedTicket.ticket_served_datetime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">No Show On:</p>
                                    <p className="text-base">{formatDateTime(selectedTicket.ticket_no_show_datetime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Cancelled On:</p>
                                    <p className="text-base">{formatDateTime(selectedTicket.ticket_cancelled_datetime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-500">Reason Code:</p>
                                    <p className="text-base">{selectedTicket.ticket_reason_code || 'N/A'}</p>
                                </div>

                                {/* Created/Updated By */}
                                <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
                                    <p className="text-sm font-semibold text-gray-500">Created By:</p>
                                    <p className="text-base">{selectedTicket.createdBy || 'N/A'}</p>
                                </div>
                                <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
                                    <p className="text-sm font-semibold text-gray-500">Last Updated By:</p>
                                    <p className="text-base">{selectedTicket.updatedBy || 'N/A'}</p>
                                </div>

                                {/* Displaying service-related fields if they are available in selectedTicket */}
                                {selectedTicket.service_name && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-500">Service Name:</p>
                                        <p className="text-lg font-bold">{selectedTicket.service_name}</p>
                                    </div>
                                )}
                                {selectedTicket.service_description && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-500">Service Description:</p>
                                        <p className="text-lg font-bold">{selectedTicket.service_description}</p>
                                    </div>
                                )}
                                {selectedTicket.service_location && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-500">Service Location:</p>
                                        <p className="text-lg font-bold">{selectedTicket.qc_service_location_desc || selectedTicket.service_location}</p>
                                    </div>
                                )}
                                {selectedTicket.service_discipline && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-500">Service Discipline:</p>
                                        <p className="text-lg font-bold">{selectedTicket.qc_service_discipline_desc || selectedTicket.service_discipline}</p>
                                    </div>
                                )}
                                {selectedTicket.no_of_counters && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-500">Number of Counters:</p>
                                        <p className="text-lg font-bold">{selectedTicket.no_of_counters}</p>
                                    </div>
                                )}
                                {selectedTicket.counter_prefix && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-500">Counter Prefix:</p>
                                        <p className="text-lg font-bold">{selectedTicket.counter_prefix}</p>
                                    </div>
                                )}
                                {selectedTicket.ticket_number_prefix && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-500">Ticket Number Prefix:</p>
                                        <p className="text-lg font-bold">{selectedTicket.ticket_number_prefix}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600">No ticket selected for details.</p>
                        )}
                    </CardContent>
                    <CardFooter className='flex justify-end'>
                        <Button onClick={onClose} variant='secondary' type='button'>Close</Button>
                    </CardFooter>
                </Card>
            </DialogPanel>
        </Dialog>
    );
}

export default TicketDetails;