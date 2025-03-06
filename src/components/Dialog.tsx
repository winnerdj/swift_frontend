import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Dialog as HDialog,
    DialogPanel as Panel,
    DialogTitle,
    DialogBackdrop,
} from "@headlessui/react";

type DialogProps = {
    open: boolean;
    onClose?: (value: boolean) => void;
    className?: string;
    children: React.ReactNode;
};

const Dialog: React.FC<DialogProps> = ({ open, onClose=()=>{}, className, children }) => (
    <HDialog
        as="div"
        open={open}
        onClose={onClose}
        className={cn("relative z-10 focus:outline-none", className)}
    >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
            {children}
        </div>
    </HDialog>
);

type DialogPanelProps = {
    className?: string;
    children: React.ReactNode;
};

const DialogPanel: React.FC<DialogPanelProps> = ({ className, children }) => (
    <Panel transition
        className={cn(
            "w-full max-w-md rounded-xl bg-white backdrop-blur-xl duration-150 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0",
            className
        )}
    >{children}
    </Panel>
);

export { Dialog, DialogPanel, DialogTitle };