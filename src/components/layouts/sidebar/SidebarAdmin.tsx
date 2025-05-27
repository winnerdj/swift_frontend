import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroupContent,
    useSidebar
} from "@/components/ui/sidebar";
import { defaultModules, moduleTypes } from "@/lib/router.modules";
import React from "react";
import { NavLink } from "react-router-dom";
import * as LucideIcons from "lucide-react"; // ✅ Import all Lucide icons dynamically
import { LucideIcon } from "lucide-react"; // ✅ Import the type

interface SidebarAdminProps {}

const SidebarAdmin: React.FC<SidebarAdminProps> = () => {
    const { setOpen } = useSidebar(); // Access sidebar state

    // ✅ Group modules by module_group
    let moduleHeader = defaultModules.reduce<Record<string, moduleTypes[]>>(
        (acc, curr) => {
            if (!acc[curr.module_group]) {
                acc[curr.module_group] = [];
            }
            acc[curr.module_group].push(curr);
            return acc;
        },
        {}
    );

    return (
        <div>
            {Object.keys(moduleHeader).map((headerGroupName) => (
                <SidebarGroup key={headerGroupName}>
                    <SidebarGroupLabel>{headerGroupName}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {moduleHeader[headerGroupName].map((item) => {
                                const IconComponent = LucideIcons[item.icon as keyof typeof LucideIcons] as LucideIcon || LucideIcons.File; // ✅ Explicit type casting

                                return (
                                    <SidebarMenuItem key={item.module_key}>
                                        <SidebarMenuButton asChild>
                                            <NavLink to={item.route} onClick={() => setOpen(false)} className="flex items-center gap-2">
                                                <IconComponent className="w-5 h-5" /> {/* ✅ No more TypeScript error */}
                                                {item.module_name}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </div>
    );
};

export default SidebarAdmin;
