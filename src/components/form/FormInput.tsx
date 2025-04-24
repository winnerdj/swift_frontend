import * as React from "react"

import { cn } from "@/lib/utils"
import { FormControl,FormItem, FormLabel, FormMessage } from "../ui/form"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}


const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({className, type,label,...props}, ref) => {
        return (
            <FormItem className="flex flex-col gap-0">
                <FormLabel className="font-semibold font-sans" >{label}</FormLabel>
                <FormControl>
                    <input
                        type={type}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </FormControl>
                <FormMessage className='text-xs'/>
            </FormItem>
        )
    }
)

FormInput.displayName = 'FromInput'

export default FormInput