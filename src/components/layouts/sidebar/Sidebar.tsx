import React from "react";
import {
    Sidebar,
    SidebarContent,
    // SidebarHeader
} from "@/components/ui/sidebar";
import SidebarAdmin from "./SidebarAdmin";

const AppSidebar: React.FC = () => {
    return (
        <Sidebar variant="sidebar" className="duration-200 inset-y-12 w-50">
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
    );
};

export default AppSidebar;