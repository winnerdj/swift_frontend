import React from 'react'
import {ChevronsUpDown} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/redux.hooks';
import { getSession } from '@/lib/redux/slices/auth.slice';
import { useAppDispatch } from '@/hooks/redux.hooks';
import { setLogOut } from '@/lib/redux/slices/auth.slice';

interface AccountComboBoxProps {

}

const AccountComboBox: React.FC<AccountComboBoxProps> = () => {
    const {
        username,
        role_name
    } = useAppSelector(getSession);
   
    const dispatch = useAppDispatch();

    const handleSignOut = () => {
        dispatch(setLogOut())
    }

    return (
        <Popover>
            <PopoverTrigger asChild >
                <Button variant={'outline'}><ChevronsUpDown /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
            <div className="grid gap-2 ">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none ">{username}</h4>
                    <p className="text-sm text-muted-foreground">
                        {role_name}
                    </p>
                </div>
                <Button variant={'outline'}>Update Password</Button>
                <Button variant={'outline'} onClick={handleSignOut}>Sign Out</Button>
            </div>   
            </PopoverContent>
        </Popover>
    );
}

export default AccountComboBox