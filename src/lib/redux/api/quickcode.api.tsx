import {apiSlice} from '../api';

type createQuickcode = {
    qc_type: string;
    qc_code: string;
    qc_description: string;
    qc_alternative_code1: string;
    qc_alternative_code2: string;
    qc_alternative_code3: string;
    qc_remarks1: string;
    qc_remarks2: string;
    qc_remarks3: string;
}

type updateQuickcode = {
    qc_id: string;
    qc_type: string;
    qc_code: string;
    qc_status: boolean;
    qc_description: string;
    qc_alternative_code1: string;
    qc_alternative_code2: string;
    qc_alternative_code3: string;
    qc_remarks1: string;
    qc_remarks2: string;
    qc_remarks3: string;
}

export const { useCreateQuickcodeMutation, useUpdateQuickcodeMutation } = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createQuickcode: builder.mutation<any, createQuickcode>({
            query: (args) => ({
                url: '/quickcode',
                method: 'POST',
                body: args
            }),
            invalidatesTags:['Table']
        }),
        updateQuickcode: builder.mutation<any, updateQuickcode>({
            query: (args) => ({
                url: '/quickcode',
                method: 'PUT',
                body: args,
            }),
            invalidatesTags:['Table']
        })
    })
})
