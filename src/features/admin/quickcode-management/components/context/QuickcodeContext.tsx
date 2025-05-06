import React, { createContext, Dispatch, SetStateAction } from 'react'

interface SelectedQuickcodeInterface {
    quickcode_id: string;
    quickcode_name: string;
    quickcode_description: string;
}

export const QuickcodeContext = createContext({
    state: {} as Partial<SelectedQuickcodeInterface>,
    setState: {} as Dispatch<SetStateAction<Partial<SelectedQuickcodeInterface>>>
})

export const QuickcodeContextProvider = ({children, value = {} as SelectedQuickcodeInterface}:{children: React.ReactNode, value?: Partial<SelectedQuickcodeInterface>}) => {
    const [state, setState] = React.useState(value);

    return <QuickcodeContext.Provider value={{ state, setState }}>
        {children}
    </QuickcodeContext.Provider>
}
