import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupContent } from '@/components/ui/sidebar';
import { admin, pvmDashboard } from '@/lib/router.modules';
import React from 'react'
import { NavLink } from 'react-router-dom';

interface SidebarAdminProps {

}

const SidebarAdmin: React.FC<SidebarAdminProps> = () => {
    return (
        <div>
            <SidebarGroup>
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {
                            admin.map(item => (
                                <SidebarMenuItem key={item.module_key}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.route}>
                                            {item.module_name}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))
                        }
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
            <SidebarGroupLabel>PVM</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {
                        pvmDashboard.map(item => (
                            <SidebarMenuItem key={item.module_key}>
                                <SidebarMenuButton asChild>
                                    <NavLink to={item.route}>
                                        {item.module_name}
                                    </NavLink>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))
                    }
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    </div>
    );
}

export default SidebarAdmin