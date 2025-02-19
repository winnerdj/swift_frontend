import React from 'react'
import { UserRound } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/redux.hooks';
import { getSession } from '@/lib/redux/slices/auth.slice';
import { useAppDispatch } from '@/hooks/redux.hooks';
import { setLogOut } from '@/lib/redux/slices/auth.slice';

interface AccountComboBoxProps {

}

const AccountComboBox: React.FC<AccountComboBoxProps> = () => {
    const { user_id } = useAppSelector(getSession);

    const dispatch = useAppDispatch();
    const handleSignOut = () => { dispatch(setLogOut()) }

    return (
        <Popover>
            <PopoverTrigger asChild >
                <Button variant={'ghost'} className='w-fit p-2 flex' >
                    <UserRound className='size-2'/>
                    <h4 className="font-bold">{user_id}</h4>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
                <PopoverPrimitive.Arrow className="fill-white stroke-border h-2 w-4" />
                <div className="grid gap-2 ">
                    <Button variant={'outline'}>Update Password</Button>
                    <Button variant={'outline'} onClick={handleSignOut}>Sign Out</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default AccountComboBox