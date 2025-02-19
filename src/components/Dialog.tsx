import * as React from "react"
import { cn } from "@/lib/utils"

import { Dialog as HDialog, DialogPanel as Panel, DialogTitle, DialogBackdrop } from '@headlessui/react';

type dialogTypes = {
    open: boolean;
    onClose?: (value:boolean) => void;
    className?: string;
    children: React.ReactNode;
}

const Dialog: React.FC<dialogTypes> = ({children,className,...props}) => (
    <HDialog
        as='div'
        className={cn('relative z-10 focus:outline-none',className)}
        onClose={props.onClose ? props.onClose : () => {}}
        {...props}
    >
        <DialogBackdrop transition className="fixed inset-0 bg-black/30"/>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    {children}
                </div>
            </div>
    </HDialog>
)

type panelTypes = {
    className?: string;
    children: React.ReactNode
}

const DialogPanel:React.FC<panelTypes> = ({className,...props}) => (
    <Panel transition className={cn('w-full max-w-md rounded-xl bg-white backdrop-blur-xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0',className)}>
        {props.children}
    </Panel>
)


export {
    Dialog,
    DialogPanel,
    DialogTitle
}


