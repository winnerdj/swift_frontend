import {createBrowserRouter} from "react-router-dom";
import App from '@/App';
import { Auth } from "@/features/auth";
import Link from '@/components/Link';
import { User } from "@/features/admin/user-management";
import { Role } from "@/features/admin/role-management";
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
