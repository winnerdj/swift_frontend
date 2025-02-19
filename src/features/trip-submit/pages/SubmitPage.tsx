import React from 'react'
import TripForm from '../components/forms/TripForm';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hooks';
import { getTrip, setTrip } from '@/lib/redux/slices/trip.slice';
import Label from '@/components/Label';
import kli from '@/assets/alt-kli.png';
import { Button } from '@/components/ui/button';
import { useExecuteTripMutation } from '@/lib/redux/api/trip.slice';
import { toast } from 'react-toastify';


interface SubmitPageProps {

}

const SubmitPage: React.FC<SubmitPageProps> = () => {
  const dispatch = useAppDispatch(); 
  const trip = useAppSelector(getTrip);
  const [onExecuteTrip, {isLoading}] = useExecuteTripMutation();
   

  // React.useEffect(() => {
  //     // const timeOut = setTimeout(()=> {
  //     //     dispatch(setTrip({
  //     //         trip_id:        null,
  //     //         trip_status:    null,
  //     //         trucker_name:   null,
  //     //         vehicle_id:     null,
  //     //         vehicle_type:   null,
  //     //     }))
         
  //     // },30000)

  //     //return () => clearTimeout(timeOut)
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[trip])

  const handleExecuteTrip = async() => {
    if(trip.trip_status === 'EXECUTED'){
      return dispatch(setTrip({
              trip_id:        null,
              trip_status:    null,
              trucker_name:   null,
              vehicle_id:     null,
              vehicle_type:   null,
      }))
    }

    await onExecuteTrip({
      trip_id: String(trip.trip_id) ,
      plate_no: String(trip.vehicle_id)
    })
    .unwrap()
    .then(() => {
      dispatch(setTrip({
        ...trip,
        trip_status: 'EXECUTED'
      }));

      toast.success('Trip Executed')
    })
  }

    return <>
      <div className="flex h-screen">
        <div className='bg-[#1A373E] w-1/4 flex flex-col p-14 gap-10'>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-200">
            Enter your Trip and Plate Number:
          </h1>
           <TripForm/>
        </div>
        <div className="flex flex-col p-14 w-full gap-5">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5x">
                Results:
            </h1>

            <div className='border w-full h-96 rounded-md container py-5'>
                {
                  trip.trip_id ?
                  <div className='flex flex-col h-full'>
                      <div className='grid grid-cols-2 gap-2'>
                        <Label
                          label='Trip Number:'
                          value={trip.trip_id}
                        />
                        <Label
                          label='Trip Status:'
                          value={trip.trip_status}
                        />
                        <Label
                          label='Trucker Name:'
                          value={trip.trucker_name}
                        />
                        <Label
                          label='Plate Number:'
                          value={trip.vehicle_id}
                        />
                      </div>
                    {
                      trip.trip_status === 'EXECUTED' ?
                      <div className='flex justify-center py-10 text-2xl font-semibold'>
                          Please take a photo of this screen.
                      </div> : null
                    }
                   
                    <div className='flex flex-1 justify-end items-end w-full'>
                      <Button isLoading={isLoading} onClick={handleExecuteTrip}>{
                        trip.trip_status === 'EXECUTED' ?
                        'Done' : 'Execute' 
                      }</Button>
                    </div>
                  </div>
                 :
                  <div className='flex h-full justify-center items-center'>
                      <img className='h-20' src={kli} alt='kli_logo'/>
                  </div>
                
                }
            </div>
        </div>
    </div>
    </>
}

export default SubmitPage