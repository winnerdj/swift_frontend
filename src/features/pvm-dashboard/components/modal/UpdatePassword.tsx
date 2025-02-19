import { Dialog,DialogPanel } from '@/components/Dialog';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react'

interface UpdatePasswordProps {
    onClose: () => void;
    isOpen: boolean;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = (props) => {
    return (
        <Dialog open={props.isOpen} onClose={()=>{}}>
            <DialogPanel>
                <Card>
                    <CardHeader>
                        <CardTitle>Update Password</CardTitle>
                    </CardHeader>
                </Card>
            </DialogPanel>
        </Dialog>
    );
}

export default UpdatePassword