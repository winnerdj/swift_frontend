import React, { createContext, Dispatch, SetStateAction } from 'react'

interface SelectedUserActivityInterface {
    service_id: string;
    service_name: string;
    service_description: string;
}

export const UserActivityContext = createContext({
    state: {} as Partial<SelectedUserActivityInterface>,
    setState: {} as Dispatch<SetStateAction<Partial<SelectedUserActivityInterface>>>
})

export const UserActivityContextProvider = ({children, value = {} as SelectedUserActivityInterface}:{children: React.ReactNode, value?: Partial<SelectedUserActivityInterface>}) => {
    const [state, setState] = React.useState(value);

    return <UserActivityContext.Provider value={{ state, setState }}>
        {children}
    </UserActivityContext.Provider>
}
