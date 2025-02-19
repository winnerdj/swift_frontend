import React from 'react'
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'
import { Form,FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '../../../../components/ui/button';
import { useLazyGetTripQuery } from '@/lib/redux/api/trip.slice';
import { useAppDispatch } from '@/hooks/redux.hooks';
import { setTrip } from '@/lib/redux/slices/trip.slice';
import { toast } from 'react-toastify';


interface TripFormProps {

}

const tripSchema = yup.object({
    trip: yup.string().required('Trip Plan Number is required.'),
    plateNo: yup.string().required('Plate Number is required.')
})

type tripSchemaType = yup.InferType<typeof tripSchema>


const TripForm: React.FC<TripFormProps> = () => {
    const dispatch = useAppDispatch();
    const [getTrip, {isLoading}] = useLazyGetTripQuery();
    const form = useForm<tripSchemaType>({
        resolver: yupResolver(tripSchema),
        defaultValues:{
            trip: '',
            plateNo:''
        }
    })

    const handleSubmit = async(values: tripSchemaType) => {
        await getTrip({
            trip_id: values.trip,
            plate_no: values.plateNo
        })
        .unwrap()
        .then(result  => {
            if(result){
                dispatch(setTrip({
                    trip_id:        result.trip_log_id,
                    trip_status:    result.trip_status,
                    trucker_name:   result.trucker_name,
                    vehicle_id:     result.vehicle_id,
                    vehicle_type:   result.vehicle_tye
                }))
                toast.success('Success!')
            }
        })
    }

    React.useEffect(() => {
        if(form.formState.isSubmitSuccessful){
            form.reset();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[form.formState, form.reset])

    return <div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className='flex flex-col gap-3 text-gray-50'>
                <FormField
                    control={form.control}
                    name='trip'
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className='text-xl'>Trip Number</FormLabel>
                            <FormControl>
                                <Input className='bg-inherit items-center text-2xl h-14' placeholder='Trip Number' {...field}/>
                            </FormControl>
                            <FormMessage className='text-xs'/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='plateNo'
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className='text-xl'>Plate Number</FormLabel>
                            <FormControl>
                                <Input className='bg-inherit  items-center text-2xl h-14' placeholder='Plate Number' {...field}/>
                            </FormControl>
                            <FormMessage className='text-xs'/>
                        </FormItem>
                    )}
                />
                <Button size={'lg'} isLoading={isLoading} className='bg-orange-500 hover:bg-orange-600' type='submit' >Submit</Button>
            </div>
        </form>
    </Form>;
    </div>
   
}

export default TripForm