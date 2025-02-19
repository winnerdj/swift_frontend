import { Navigate, Outlet } from "react-router-dom";
import Header from "@/components/layouts/header/Header";
import { useAppSelector } from "./hooks/redux.hooks"
import { getSession } from "./lib/redux/slices/auth.slice"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import AppSidebar from "./components/layouts/sidebar/Sidebar";
import { Separator } from "./components/ui/separator";
import AppBreadcrumb from "./components/layouts/breadcrumbs/Breadcrumbs";

function App() {
  const token = useAppSelector(getSession);

  if(!token.user_id) {
    return <Navigate to='/login' replace/>
  }

  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <Header>
          <SidebarTrigger className="-ml-1"/>
          <Separator orientation="vertical" className="mr-2 h-6"/>
          <AppBreadcrumb/>
        </Header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet/>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
