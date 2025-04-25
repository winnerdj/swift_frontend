import React, { createContext, Dispatch, SetStateAction } from 'react'

interface SelectedUserInterface {
    id:string;
    username: string;
    app_key: string;
    is_active: number;
    role_name: string;
    role_id: string;
}

export const UserContext = createContext({
    state: {} as Partial<SelectedUserInterface>,
    setState: {} as Dispatch<SetStateAction<Partial<SelectedUserInterface>>>
})

export const UserContextProvider = ({children, value = {} as SelectedUserInterface}:{children: React.ReactNode, value?: Partial<SelectedUserInterface>}) => {
    const [state, setState] = React.useState(value);

    return <UserContext.Provider value={{ state, setState }}>
        {children}
    </UserContext.Provider>
}
