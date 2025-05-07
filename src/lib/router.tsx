import {createBrowserRouter} from "react-router-dom";
import App from '@/App';
import { Auth } from "@/features/auth";
import Link from '@/components/Link';
import { User } from "@/features/admin/user-management";
import { Role } from "@/features/admin/role-management";
import { Quickcode } from "@/features/admin/quickcode-management";
import { Service } from "@/features/admin/service-management";

import { PvmDashboard } from "@/features/pvm-dashboard";

const route = createBrowserRouter([
    {
        path:'/',
        element: <App/>,
        children: [
            {
                path:'/user',
                element: <User/>,
                handle: {
                    crumb: () => (
                        <Link path='/user' label="User Management"/>
                    )
                }
            },
            {
                path:'/role',
                element: <Role/>,
                handle: {
                    crumb: () => (
                        <Link path='/role' label="Role Management"/>
                    )
                }
            },
            {
                path:'/quickcode',
                element: <Quickcode/>,
                handle: {
                    crumb: () => (
                        <Link path='/quickcode' label="QuickCode Management"/>
                    )
                }
            },
            {
                path:'/service',
                element: <Service/>,
                handle: {
                    crumb: () => (
                        <Link path='/service' label="Service Management"/>
                    )
                }
            },
            {
                path:'/pvm/dashboard',
                element: <PvmDashboard/>,
                handle: {
                    crumb: () => (
                        <Link path='/dashboard' label="PVM Dashboard"/>
                    )
                }
            }
        ]
    },
    {
        path:'/login',
        element: <Auth/>
    },
])

export default route
