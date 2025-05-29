import {createBrowserRouter} from "react-router-dom";
import App from '@/App';
import { Auth } from "@/features/auth";
import Link from '@/components/Link';
import { User } from "@/features/administration/user-management";
import { Role } from "@/features/administration/role-management";
import { Quickcode } from "@/features/data-management/quickcode-management";
import { Service } from "@/features/data-management/service-management";
import { Kiosk } from "@/features/queue-management/kiosk";
import { QueueDisplay } from "@/features/queue-management/queue-display";

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
                        <Link path='/user' label="User Administration"/>
                    )
                }
            },
            {
                path:'/role',
                element: <Role/>,
                handle: {
                    crumb: () => (
                        <Link path='/role' label="Role Administration"/>
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
                path:'/kiosk',
                element: <Kiosk/>,
                handle: {
                    crumb: () => (
                        <Link path='/kiosk' label="Kiosk"/>
                    )
                }
            },
            {
                path:'/queue-display',
                element: <QueueDisplay/>,
                handle: {
                    crumb: () => (
                        <Link path='/queue-display' label="Queue Display"/>
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
