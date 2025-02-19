import { Dialog, DialogPanel } from '@/components/Dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateUserMutation } from '@/lib/redux/api/user.api';
import {Button} from '@/components/ui/button'
import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext';
import APISelect from '@/components/select/APISelect';
import { toast } from 'react-toastify';

interface UpdateRoleProps {
    onClose: () => void;
    isOpen: boolean;
}

const UpdateRole: React.FC<UpdateRoleProps> = (props) => {
    const context = useContext(UserContext)
    const [updateRole,updateRoleProps] = useUpdateUserMutation();
    const [role, setRole] = React.useState<{label: string; value:string} | null> ({
        label: context.state.role_name as string,
        value: context.state.role_id as string
    })
    const handleUpdateRole = async() => {
        if(!role) return toast.error('Role is required!')

        await updateRole({
            id: context.state.id as string,
            role_id: role?.value
        })
        .unwrap()
        .then(() => {
            context.setState({
                ...context.state,
                role_name: role.label,
                role_id: role.value
            })

            toast.success('Role Updated')
        })
    }

    return <Dialog open={props.isOpen} onClose={()=>{}}>
        <DialogPanel>
            <Card>
                <CardHeader>
                    <CardTitle>Update Role</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col gap-2'>
                        <div className='grid grid-flow-col'>
                            <label className='col-span-1 font-semibold'>Username: </label>
                            <label className='col-span-4'>{context.state.username} </label>
                        </div>
                        <div className='grid grid-flow-col'>
                            <label className='col-span-1 font-semibold'>Current Assigned Role: </label>
                            <label className='col-span-4'>{context.state.role_name} </label>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='font-semibold'>New Role: </label>
                            <APISelect
                                type={'role'}
                                onChange={(selected)=>{setRole(selected)}}
                                value={role}
                                placeholder='Select Role'
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className='flex justify-between'>
                        <Button variant={'destructive'} onClick={props.onClose} disabled={updateRoleProps.isLoading}>Close</Button>
                        <Button onClick={handleUpdateRole} isLoading={updateRoleProps.isLoading} disabled={!role}>Save</Button>
                </CardFooter>
            </Card>
        </DialogPanel>
    </Dialog>;
}

export default UpdateRole