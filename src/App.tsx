import { Navigate, Outlet } from "react-router-dom";
import Header from "@/components/layouts/header/Header";
import { useAppSelector } from "./hooks/redux.hooks";
import { getSession } from "./lib/redux/slices/auth.slice";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger
} from "./components/ui/sidebar";
import AppSidebar from "./components/layouts/sidebar/Sidebar";
import { Separator } from "./components/ui/separator";
import AppBreadcrumb from "./components/layouts/breadcrumbs/Breadcrumbs";

function App() {
    // Get user session
    const token = useAppSelector(getSession);

    // Redirect to login if no user session exists
    if(!token.user_id) {
        return <Navigate to="/login" replace />;
    }

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <Header>
                    {/* Sidebar Toggle Button */}
                    <SidebarTrigger variant={'link'} className="-ml-1 text-gray-300 hover:text-white" />
                    <Separator orientation="vertical" className="mr-2 h-6" />
                    <AppBreadcrumb />
                </Header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-200">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default App;