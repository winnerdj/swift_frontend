import React, { createContext, Dispatch, SetStateAction } from 'react'

interface SelectedKioskInterface {
    kiosk_id: string;
    kiosk_name: string;
    kiosk_description: string;
}

export const KioskContext = createContext({
    state: {} as Partial<SelectedKioskInterface>,
    setState: {} as Dispatch<SetStateAction<Partial<SelectedKioskInterface>>>
})

export const KioskContextProvider = ({children, value = {} as SelectedKioskInterface}:{children: React.ReactNode, value?: Partial<SelectedKioskInterface>}) => {
    const [state, setState] = React.useState(value);

    return <KioskContext.Provider value={{ state, setState }}>
        {children}
    </KioskContext.Provider>
}
