import { Dialog, DialogPanel } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/components/form/FormInput';
import React from 'react'
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormAppLabel from '@/components/form/FormLabel';
import { useCreateUserMutation, useGenerateAppKeyMutation } from '@/lib/redux/api/user.api';
// import FormAPISelect from '@/components/form/FormAPISelect';
import { toast } from 'react-toastify';


interface CreateUserProps {
    onClose: () => void;
    isOpen: boolean;
}


const createUserSchema = yup.object({
    username: yup.string().required('required'),
    //password: yup.string().required('required'),
    app_key: yup.string().required('Please generate an application key'),
    role: yup.object({
        label: yup.string().required(),
        value: yup.string().required()
    }).nullable().notOneOf([null],'Role is required'),
})

type createUserType = yup.InferType<typeof createUserSchema>


const CreateUser: React.FC<CreateUserProps> = (props) => {
    const [generateAppKey, genAppKeyprops] = useGenerateAppKeyMutation();
    const [createUser, createUserProps] = useCreateUserMutation();
    const form = useForm<createUserType>({
        resolver: yupResolver(createUserSchema),
        defaultValues: {
            username:'',
            //password:'',
            app_key:'',
            role: null
        }
    })  
   
    const handleSubmit = async (data:createUserType ) => {
        await createUser({
            username: data.username,
            app_key: data.app_key,
            role_id: data.role?.value as string
        })
        .unwrap()
        .then(() => {
            toast.success('User Created')
        })

        form.reset({
            username:'',
            app_key:'',
            role: null
        })
    }

    const handleGenerateAppKey = async() => {
        await generateAppKey()
        .unwrap()
        .then(result => {
            form.setValue('app_key', result.key)
            console.log(result)
        })

        toast.success('App Key Generated')
    }

    return (
      <Dialog open={props.isOpen} onClose={()=>{}}>
        <DialogPanel>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Create User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid grid-cols-1 gap-2'>
                                <FormField
                                    control={form.control}
                                    name='username'
                                    render={({field}) => (
                                        <FormInput {...field} label='Username' placeholder='Username'/>
                                    )}
                                />
                               
                                <FormField
                                    control={form.control}
                                    name='app_key'
                                    render={({field}) => (
                                        <div className = 'flex items-center justify-between'>
                                            <FormAppLabel label='App Key' value={field.value}/> 
                                            <Button type='button' size={'sm'} variant={'outline'} isLoading={genAppKeyprops.isLoading } disabled={createUserProps.isLoading} onClick={handleGenerateAppKey}>Create</Button>
                                        </div> 
                                    )}
                                />

                                {/* <FormAPISelect
                                    control={form.control}
                                    name='role'
                                    type='role'
                                    label='Role'
                                /> */}
                               
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-between'>
                            <Button onClick={props.onClose} variant={'destructive'} type='button'>Close</Button>
                            <Button type='submit' isLoading={createUserProps.isLoading} disabled={genAppKeyprops.isLoading}>Save</Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </DialogPanel>
      </Dialog>
    );
}

export default CreateUser