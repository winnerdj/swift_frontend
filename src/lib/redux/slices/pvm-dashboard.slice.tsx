import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { RootState } from '../store';

type itemType = {
    title               : string;
    valuePending        : number | string;
    valueFetched        : number | string;
    valueTransferred    : number | string;
    description         : string;
    type                : string;
}

interface pvmDashboardType  {
    SAP_to_3PL :   itemType[];
    '3PL_to_SAP':    itemType[];
}

const initialState: pvmDashboardType = {
    "SAP_to_3PL" : [],
    "3PL_to_SAP" : []
}

export const pvmDashboardSlice = createSlice({
    name:'pvmDashboard',
    initialState,
    reducers:{
        setPvmDashboard: (state, action: PayloadAction<pvmDashboardType>) => ({
            ...state,
            ...action.payload
        })
    }
})

export const {setPvmDashboard} = pvmDashboardSlice.actions;
export const getPvmDashboard = (state: RootState) => state.pvmDashboardSlice
export default pvmDashboardSlice.reducer
