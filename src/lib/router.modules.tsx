export type modules = {
    module_key: string,
    module_name: string,
    route: string,
}

const admin: modules[] = [
    {
        module_key: 'user_management',
        module_name: 'User Management',
        route: '/user'
    },
    {
        module_key: 'role_management',
        module_name: 'Role Management',
        route: '/role'
    }
]

const pvmDashboard: modules[] = [
    {
        module_key: 'pvm_dashboard',
        module_name: 'PVM Dashboard',
        route: '/pvm/dashboard'
    }
]



export {
    admin
    ,pvmDashboard
}