import React from 'react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from '@/components/ui/input';

import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// import FormAPISelect from '@/components/form/FormAPISelect';
import { useGetTruckerQuery,useSubmitClearanceMutation } from '@/lib/redux/api/trucker-clearance.api';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';


interface TruckerFormProps {

}

const formSchema = yup.object({
    trip_no:  yup.string().required('Required'),
    plate_no: yup.object({
        label: yup.string().required(),
        value: yup.string().required()
    }).nullable().notOneOf([null],'Required'),
    plate_no_vqic: yup.bool().required('Please confirm that plate number matches VQIC.').oneOf([true], 'Please confirm that plate number matches VQIC.'),
    trucker_name_vqic: yup.bool().required('Please confirm that the trucker name matches VQIC.').oneOf([true], 'Please confirm that trucker name matches VQIC.'),
})

type formSchemaType = yup.InferType<typeof formSchema>


const TruckerForm: React.FC<TruckerFormProps> = () => {
    const [onSubmit, {isLoading}] = useSubmitClearanceMutation()
    const form = useForm<formSchemaType>({
        resolver: yupResolver(formSchema),
        defaultValues: {
            trip_no: '',
            plate_no: null
        }
    })

    const plate_no = form.watch('plate_no');

    const {data = {},...getTruckerProps} = useGetTruckerQuery(plate_no?.value || '')

    const handleSubmit = async(values:formSchemaType ) => {

        await onSubmit({
            trip_no: values.trip_no,
            plate_no: values.plate_no?.value as string,
            vehicle_type: data?.vehicle_type as string,
            trucker: data?.trucker_id as string
        })
        .unwrap()
        .then(() => {
            toast.success('Trucker Cleared \n Please generate the Trucker Clearance Form in Helios')
            form.reset({
                trip_no: '',
                plate_no: null
            })
        })
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Form {...form}>
                <div className='flex flex-col gap-2 w-[400px]'>
                    <FormField
                        control={form.control}
                        name='trip_no'
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Trip No</FormLabel>
                                <FormControl>
                                    <Input className='bg-inherit' placeholder='Trip No' {...field}/>
                                </FormControl>
                                <FormMessage className='text-xs'/>
                            </FormItem>
                        )}
                    />
                    {/* <FormAPISelect
                        control={form.control}
                        name='plate_no'
                        label='Plate No'
                        placeholder='Plate No'
                    />  */}
                    <FormField
                        control={form.control}
                        name='plate_no_vqic'
                        render={({field}) => (
                            <FormItem>
                                <div className='flex gap-1 items-center'>
                                    <FormControl>
                                        <Input type='checkbox' className='h-5 w-5'  onChange={(e) => field.onChange(e.target.checked)} checked={field.value}/> 
                                    </FormControl>
                                    <FormLabel>Plate number matches VQIC</FormLabel>
                                </div>
                                <FormMessage className='text-xs'/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='trucker_name_vqic'
                        render={({field}) => (
                            <FormItem>
                                <div className='flex gap-1 items-center'>
                                    <FormControl>
                                        <Input type='checkbox' className='h-5 w-5'  onChange={(e) => field.onChange(e.target.checked)} checked={field.value}/> 
                                    </FormControl>
                                    <FormLabel>Trucker Name matches VQIC</FormLabel>
                                </div>
                                <FormMessage className='text-xs'/>
                            </FormItem>
                        )}
                    />
                        
                    <div className='grid grid-cols-2 gap-2'>
                        <label>Trucker Name:</label> <label>{data?.trucker_name}</label>
                        <label>Vehicle Type:</label> <label>{data?.vehicle_type}</label>
                    </div> 
                    <Button isLoading={isLoading || getTruckerProps.isLoading}>Submit</Button>          
                </div>
            </Form>
        </form>
    );
}

export default TruckerForm