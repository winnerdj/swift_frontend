export type userActivityTableType = {
    service_id : string,
    service_location : string,
    qc_service_location : string,
    qc_service_location_desc : string,
    service_name : string,
    service_status : boolean,
    service_description : string,
    service_discipline : string,
    qc_service_discipline : string,
    qc_service_discipline_desc : string,
    no_of_counters : number,
    counter_prefix : string,
    ticket_number_prefix : string,
    recall_waiting_flag : boolean,
    recall_waiting_time : number,
    service_remarks1 : string,
    service_remarks2 : string,
    service_remarks3 : string,
    srv_user_activity : {
        service_name : string,
    }
}