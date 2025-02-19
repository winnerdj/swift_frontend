import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { RootState } from '../store';

type tripSliceType = {
    trip_id:        string|null;
    trip_status:    string|null;
    trucker_name:   string|null;
    vehicle_id:     string|null;
    vehicle_type:   string|null;
}

const initialState: tripSliceType = {
    trip_id:        null,
    trip_status:    null,
    trucker_name:   null,
    vehicle_id:     null,
    vehicle_type:   null,
}

export const tripSlice = createSlice({
    name:'trip',
    initialState,
    reducers:{
        setTrip: (state, action: PayloadAction<tripSliceType>) => ({
            ...state,
            ...action.payload
        })
    }
})

export const {setTrip} = tripSlice.actions;
export const getTrip = (state: RootState) => state.tripSlice
export default tripSlice.reducer

