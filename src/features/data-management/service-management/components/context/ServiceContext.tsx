import React, { createContext, Dispatch, SetStateAction } from 'react'

interface SelectedServiceInterface {
    service_id: string;
    service_name: string;
    service_description: string;
}

export const ServiceContext = createContext({
    state: {} as Partial<SelectedServiceInterface>,
    setState: {} as Dispatch<SetStateAction<Partial<SelectedServiceInterface>>>
})

export const ServiceContextProvider = ({children, value = {} as SelectedServiceInterface}:{children: React.ReactNode, value?: Partial<SelectedServiceInterface>}) => {
    const [state, setState] = React.useState(value);

    return <ServiceContext.Provider value={{ state, setState }}>
        {children}
    </ServiceContext.Provider>
}
