import React from 'react'
import { FormControl, FormItem,FormLabel, FormMessage } from '../ui/form';

interface FormLabelProps {
    label: string;
    value: string;
}

const FormAppLabel: React.FC<FormLabelProps> = (props) => {
    return (
        <FormItem className='grid grid-cols-1 gap-1'>
            <FormLabel className='font-semibold font-sans'>{props.label}</FormLabel>
            <FormControl className='auto-cols-auto'>
                <p className='text-sm'>
                    {props.value}
                </p>
            </FormControl>
            <FormMessage className='text-xs'/>
        </FormItem>
    );
}

export default FormAppLabel