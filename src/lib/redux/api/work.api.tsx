import {apiSlice} from '../api';

type workLogin = {
    service_id: string;
    counter_no: string;
}

type getTicketsTodayByServiceId = {
    service_id: string;
}

type getActiveCountersTodayByServiceId = {
    service_id: string;
}

type startServing = {
    ticket_id: string;
    ticket_status: number;
    ticket_now_serving_datetime: string;
}

type endServing = {
    ticket_id: string;
    ticket_status: number;
    ticket_served_datetime: string;
}

type noShow = {
    ticket_id: string;
    ticket_status: number;
    ticket_no_show_datetime: string;
}

type overrideTicket = {
    ticket_id : string;
    ticket_service : string;
    ticket_status : string;
    ticket_counter : number | null;
}

type cancelTicket = {
    ticket_id: string;
    ticket_reason_code: string;
}

type transferTicket = {
    ticket_id: string;
    ticket_service: string;
}

export const { 
    useWorkLoginMutation,
    useGetExistingWorkSessionDataQuery,
    useLogoutWorkSessionMutation,
    useBreaktimeWorkSessionMutation,
    useGetActiveAssignedTicketQuery,
    useLazyGetActiveAssignedTicketQuery,
    useGetTicketsTodayByServiceIdQuery,
    useLazyGetTicketsTodayByServiceIdQuery,
    usePostStartServingMutation,
    usePostEndServingMutation,
    usePostNoShowMutation,
    useOverrideTicketMutation,
    useCancelTicketMutation,
    useTransferTicketMutation,
    useGetActiveCountersTodayByServiceIdQuery
} = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workLogin: builder.mutation<any, workLogin>({
            query: (args) => ({
                url: '/work/login',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['WorkSession']
        }),
        getExistingWorkSessionData: builder.query<any, {
                user_id: string;
            }>({
                query: (args) => ({
                    url: '/work/latest-user-activity',
                    params:{
                        user_id: args.user_id,
                    }
                }),
                providesTags: ['WorkSession']
            }),
        logoutWorkSession: builder.mutation<any, void>({
            query: () => ({
                url: '/work/logout', // Your logout endpoint
                method: 'POST',
            }),
            invalidatesTags: ['WorkSession'], // Invalidate the WorkSession tag on logout
        }),
        breaktimeWorkSession: builder.mutation<any, void>({
            query: () => ({
                url: '/work/breaktime',
                method: 'POST',
            }),
            invalidatesTags: ['WorkSession']
        }),
        getActiveAssignedTicket: builder.query<any, { user_id: string; }>({
            query: (args) => ({
                url: '/work/active-assigned-ticket',
                params:{
                    user_id: args.user_id,
                }
            }),
            providesTags: ['ActiveAssignedTicket']
        }),
        getTicketsTodayByServiceId: builder.query<any, getTicketsTodayByServiceId>({
            query: (args) => ({
                url: '/work/all-tickets-today-by-service',
                method: 'GET',
                params: args,
            }),
            providesTags: ['TodayTicketsByService']
        }),
        getActiveCountersTodayByServiceId: builder.query<any, getActiveCountersTodayByServiceId>({
            query: (args) => ({
                url: '/work/all-active-counters-today-by-service',
                method: 'GET',
                params: args,
            }),
            providesTags: ['TodayTicketsByService']
        }),
        postStartServing: builder.mutation<any, startServing>({
            query: (args) => ({
                url: '/work/start-serving',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['ActiveAssignedTicket', 'TodayTicketsByService']
        }),
        postEndServing: builder.mutation<any, endServing>({
            query: (args) => ({
                url: '/work/end-serving',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['ActiveAssignedTicket', 'TodayTicketsByService']
        }),
        postNoShow: builder.mutation<any, noShow>({
            query: (args) => ({
                url: '/work/no-show',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['ActiveAssignedTicket', 'TodayTicketsByService']
        }),
        overrideTicket: builder.mutation<any, overrideTicket>({
            query: (args) => ({
                url: '/work/override-ticket',
                method: 'POST',
                body: args,
            }),
            invalidatesTags:['TodayTicketsByService']
        }),
        cancelTicket: builder.mutation<any, cancelTicket>({
            query: (args) => ({
                url: '/work/cancel-ticket',
                method: 'POST',
                body: args,
            }),
            invalidatesTags:['ActiveAssignedTicket', 'TodayTicketsByService']
        }),
        transferTicket: builder.mutation<any, transferTicket>({
            query: (args) => ({
                url: '/work/transfer-ticket',
                method: 'POST',
                body: args,
            }),
            invalidatesTags:['ActiveAssignedTicket', 'TodayTicketsByService']
        })
    })
})
