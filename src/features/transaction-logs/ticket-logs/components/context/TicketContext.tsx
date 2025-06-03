import React, { createContext, Dispatch, SetStateAction } from 'react'

interface SelectedTicketInterface {
    ticket_id: string;
}

export const TicketContext = createContext({
    state: {} as Partial<SelectedTicketInterface>,
    setState: {} as Dispatch<SetStateAction<Partial<SelectedTicketInterface>>>
})

export const TicketContextProvider = ({children, value = {} as SelectedTicketInterface}:{children: React.ReactNode, value?: Partial<SelectedTicketInterface>}) => {
    const [state, setState] = React.useState(value);

    return <TicketContext.Provider value={{ state, setState }}>
        {children}
    </TicketContext.Provider>
}
