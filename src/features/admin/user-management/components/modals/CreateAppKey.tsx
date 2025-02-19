import { Dialog, DialogPanel } from '@/components/Dialog';
import { CardContent, CardHeader, Card, CardFooter } from '@/components/ui/card';
import {Button} from '@/components/ui/button'
import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext';
import { useGenerateAppKeyMutation, useUpdateUserMutation } from '@/lib/redux/api/user.api';
import { toast } from 'react-toastify';

interface CreateAppKeyProps {
    onClose: () => void;
    isOpen: boolean;
}

const CreateAppKey: React.FC<CreateAppKeyProps> = (props) => {
    const context = useContext(UserContext);
    const [appKey, setAppKey] = React.useState<string | null>(null);
   
    const [createKey, createKeyProps] = useGenerateAppKeyMutation();
    const [updateKey, updateKeyProps] = useUpdateUserMutation();

    const handleCreateKey = async() => {
        await createKey()
        .unwrap()
        .then(result => {
            setAppKey(result.key as string);
        })
    }

    const handleUpdateKey = async() => {
        await updateKey({
            id: context.state.id as string, 
            app_key: appKey as string
        })
        .unwrap()
        .then(() => {
            context.setState({
                ...context.state,
                app_key: appKey as string
            })
            setAppKey(null);
            toast.success('App Key Updated!')
        })
    }

    const handleClose = () => {
        setAppKey(null)
        props.onClose()
    }

    return <>
        <Dialog open={props.isOpen} onClose={()=>{}}>
            <DialogPanel>
                <Card>
                    <CardHeader>
                        Update App Key
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-2'>
                            <div className ='grid grid-flow-col'>
                                <label className='col-span-1 font-semibold'>Username:</label>
                                <label className='col-span-4'>{context.state.username}</label>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='font-semibold'>Old App Key:</label>
                                <label>{context.state.app_key}</label>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <div className='flex justify-between items-center'>
                                    <label className='font-semibold'>New App Key:</label>
                                    <Button variant={'outline'} onClick={handleCreateKey} isLoading={createKeyProps.isLoading} disabled={updateKeyProps.isLoading}>Generate</Button>
                                </div>
                               
                                <label>{appKey}</label>
                            </div>                           
                        </div>
                       
                    </CardContent>
                    <CardFooter className='flex justify-between'>
                        <Button variant={'destructive'} onClick={handleClose} disabled={createKeyProps.isLoading || updateKeyProps.isLoading}>Close</Button>
                        <Button disabled={createKeyProps.isLoading || !appKey} onClick={handleUpdateKey} isLoading={updateKeyProps.isLoading}>Save</Button>
                    </CardFooter>
                </Card>
            </DialogPanel>
        </Dialog> 
    </>;
}

export default CreateAppKey