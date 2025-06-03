export type ticketTableType = {
    ticket_id : string;
    ticket_service : string;
    ticket_status : number;
    ticket_level : number;
    ticket_parent_reference : string;
    ticket_head_reference : string;
    ticket_counter : string;
    ticket_support : string;
    ticket_create_datetime : string;
    ticket_queue_datetime : string;
    ticket_assigned_datetime : string;
    ticket_now_serving_datetime : string;
    ticket_served_datetime : string;
    ticket_no_show_datetime : string;
    ticket_cancelled_datetime : string;
    ticket_reason_code : string;
    ticket_trip_number : string;
    ticket_trucker_id : string;
    ticket_trucker_name : string;
    ticket_vehicle_type : string;
    ticket_plate_num : string;
    ticket_remarks1 : string;
    ticket_remarks2 : string;
    ticket_remarks3 : string;
    createdBy : string;
    updatedBy : string;
}