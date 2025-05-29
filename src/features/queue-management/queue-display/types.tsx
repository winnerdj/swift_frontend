export type ticketType = {
    ticket_id : string;
    ticket_service : string;
    ticket_status : number;
    ticket_issue_datetime : Date;
    ticket_level : string;
    ticket_parent_reference : string;
    ticket_head_reference : string;
    ticket_counter : string;
    ticket_support : string;
    ticket_create_datetime : Date | null;
    ticket_queue_datetime : Date | null;
    ticket_assigned_datetime : Date | null;
    ticket_now_serving_datetime : Date | null;
    ticket_served_datetime : Date | null;
    ticket_no_show_datetime : Date | null;
    ticket_cancelled_datetime : Date | null;
    ticket_reason_code : string;
    ticket_trip_number : string;
    ticket_trucker_id : string;
    ticket_trucker_name : string;
    ticket_vehicle_type : string;
    ticket_plate_num : string;
    ticket_remarks1 : string;
    ticket_remarks2 : string;
    ticket_remarks3 : string;
}