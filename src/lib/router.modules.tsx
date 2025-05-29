export type moduleTypes = {
    module_group: string,
    module_key: string,
    module_name: string,
    route: string,
    icon: string
}

const defaultModules: moduleTypes[] = [
    {
        module_group: 'Administration',
        module_key: 'user_management',
        module_name: 'User',
        route: '/user',
        icon: 'UserCog'
    },
    {
        module_group: 'Administration',
        module_key: 'role_management',
        module_name: 'Role',
        route: '/role',
        icon: 'UsersRound'
    },
    {
        module_group: 'Data Management',
        module_key: 'quick_code_management',
        module_name: 'Quick Code',
        route: '/quickcode',
        icon: 'ScrollText'
    },
    {
        module_group: 'Data Management',
        module_key: 'service_management',
        module_name: 'Service',
        route: '/service',
        icon: 'Briefcase'
    },
    {
        module_group: 'Queue',
        module_key: 'kiosk',
        module_name: 'Kiosk',
        route: '/kiosk',
        icon: 'ReceiptText'
    },
    {
        module_group: 'Queue',
        module_key: 'Queue_display',
        module_name: 'Queue Display',
        route: '/queue-display',
        icon: 'Tv'
    },
    {
        module_group: 'Queue',
        module_key: 'Serve',
        module_name: 'Counter Service',
        route: '/service',
        icon: 'HandPlatter'
    },
    {
        module_group: 'Transaction',
        module_key: 'ticket',
        module_name: 'Ticket',
        route: '/dashboard',
        icon: 'Ticket'
    },
    {
        module_group: 'Transaction',
        module_key: 'userActivity',
        module_name: 'User Activity',
        route: '/user-activity',
        icon: 'BookUser'
    },
    {
        module_group: 'Dashboard & Reports',
        module_key: 'dashboard',
        module_name: 'Dashboard',
        route: '/dashboard',
        icon: 'LayoutDashboard'
    },
    {
        module_group: 'Dashboard & Reports',
        module_key: 'report',
        module_name: 'Report',
        route: '/report',
        icon: 'FileText'
    }
]


export {
    defaultModules
}