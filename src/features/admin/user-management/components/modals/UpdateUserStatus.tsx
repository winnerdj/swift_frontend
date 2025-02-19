import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, Card, CardFooter, CardTitle } from '@/components/ui/card';

import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext';
import { useUpdateUserMutation } from '@/lib/redux/api/user.api';
import { toast } from 'react-toastify';

interface UpdateUserStatusProps {
    onClose: () => void;
    isOpen: boolean;
}

const UpdateUserStatus: React.FC<UpdateUserStatusProps> = (props) => {
    const context = useContext(UserContext);
    const [updateStatus, updateStatusProps] = useUpdateUserMutation();

    const handleUpdate = async() => {
        await updateStatus({
            id: context.state.id as string,
            is_active: context.state.is_active === 1 ? 0 : 1
        })
        .unwrap()
        .then(() => {
            toast.success('User Status Updated!')
            props.onClose();
        })
    }

    return <Dialog open={props.isOpen} onClose={props.onClose}>
        <DialogPanel>
            <Card>
            <   CardHeader>
                    <CardTitle>Update Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Do you wish to <span className='font-semibold'>{context.state.is_active === 1 ? 'DEACTIVATE' : 'ACTIVATE'}</span> <span className='font-semibold'>{context.state.username}</span> account status?</p>
                </CardContent>
                <CardFooter className='flex justify-between'>
                    <Button variant={'destructive'} onClick={props.onClose} disabled={updateStatusProps.isLoading}>No</Button>
                    <Button onClick={handleUpdate} isLoading={updateStatusProps.isLoading}>Yes</Button>
                </CardFooter>
            </Card>
        </DialogPanel>
    </Dialog>;
}

export default UpdateUserStatus