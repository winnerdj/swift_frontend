import React from 'react'
import { CircleUserRound, ChevronDown } from 'lucide-react';
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
import UpdatePassword from '@/features/auth/components/modal/UpdatePassword';

interface AccountComboBoxProps {

}

const AccountComboBox: React.FC<AccountComboBoxProps> = () => {
    const { user_id } = useAppSelector(getSession);

	const [changePasswordDialog, setChangePasswordDialog] = React.useState(false);
    const dispatch = useAppDispatch();
    const handleSignOut = () => { dispatch(setLogOut()) }

	const toggleChangePassword = () => {
		setChangePasswordDialog(!changePasswordDialog);
	}

    return (
        <Popover>
            <PopoverTrigger asChild >
                <Button variant={'link'} className='flex gap-1 w-fit text-gray-400 hover:no-underline hover:text-white' >
                    <CircleUserRound className='size-2'/>
                    <h4 className="font-semibold">{user_id}</h4>
                    <ChevronDown className='size-2'/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-50 bg-white border-none">
                <PopoverPrimitive.Arrow className="fill-white stroke-border h-2 w-4" />
                <div className="grid ">
                    <Button variant={'outline'} onClick={toggleChangePassword} className='border-none hover:bg-[#CD3E3A] hover:text-white '>Update Password</Button>
                    <Button variant={'outline'} onClick={handleSignOut} className='border-none hover:bg-[#CD3E3A] hover:text-white'>Sign Out</Button>
                </div>
            </PopoverContent>
            <UpdatePassword isOpen={changePasswordDialog} onClose={toggleChangePassword} />
        </Popover>
    );
}

export default AccountComboBox