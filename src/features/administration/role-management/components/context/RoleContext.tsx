import React, { createContext, Dispatch, SetStateAction } from 'react'

interface SelectedRoleInterface {
    role_id: string;
    role_name: string;
    role_description: string;
}

export const RoleContext = createContext({
    state: {} as Partial<SelectedRoleInterface>,
    setState: {} as Dispatch<SetStateAction<Partial<SelectedRoleInterface>>>
})

export const RoleContextProvider = ({children, value = {} as SelectedRoleInterface}:{children: React.ReactNode, value?: Partial<SelectedRoleInterface>}) => {
    const [state, setState] = React.useState(value);

    return <RoleContext.Provider value={{ state, setState }}>
        {children}
    </RoleContext.Provider>
}
