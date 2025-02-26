import React from "react";
import {
    Sidebar,
    SidebarContent,
    // SidebarHeader
} from "@/components/ui/sidebar";
import SidebarAdmin from "./SidebarAdmin";
import Backdrop from "./Backdrop";

const AppSidebar: React.FC = () => {
    return (
        <div>
            <Backdrop /> {/* Backdrop Component */}
            <Sidebar variant="sidebar" className="duration-0 inset-y-12 w-50 border-none">
                {/* Sidebar Header */}
                {/* <SidebarHeader className="group-hover/sidebar:bg-transparent">
                    <div className="grid h-14 gap-2 text-center">
                        <h3 className="font-sans text-lg font-semibold">
                            Taylor Swift
                        </h3>
                    </div>
                </SidebarHeader> */}

                {/* Sidebar Content */}
                <SidebarContent>
                    <SidebarAdmin />
                </SidebarContent>
            </Sidebar>
        </div>
    );
};

export default AppSidebar;