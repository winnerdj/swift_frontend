import {apiSlice} from '../api';

type createService = {
    // service_id : string;
    service_name : string;
    service_location : string;
    // service_status : boolean;
    service_description : string;
    service_discipline : string;
    no_of_counters : number;
    counter_prefix : string;
    ticket_number_prefix : string;
    recall_waiting_flag : boolean;
    recall_waiting_time : number;
    service_remarks1 : string;
    service_remarks2 : string;
    service_remarks3 : string;
}

type updateService = {
    service_id : string;
    service_name : string;
    service_location : string;
    service_status : boolean;
    service_description : string;
    service_discipline : string;
    no_of_counters : number;
    counter_prefix : string;
    ticket_number_prefix : string;
    recall_waiting_flag : boolean;
    recall_waiting_time : number;
    service_remarks1 : string;
    service_remarks2 : string;
    service_remarks3 : string;
}

export const { useCreateServiceMutation, useUpdateServiceMutation } = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createService: builder.mutation<any, createService>({
            query: (args) => ({
                url: '/service',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['Table']
        }),
        updateService: builder.mutation<any, updateService>({
            query: (args) => ({
                url: '/service',
                method: 'PUT',
                body: args,
            }),
            invalidatesTags:['Table']
        })
    })
})
