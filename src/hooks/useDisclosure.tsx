import React from 'react';

const useDisclosure = () => {
    const [state, setState] = React.useState<Record<string, boolean>>({});

    const isOpen = (key: string) => !!state[key];
    const onOpen = (key: string) => setState((prev) => ({ ...prev, [key]: true }));
    const onClose = (key: string) => setState((prev) => ({ ...prev, [key]: false }));

    return { isOpen, onOpen, onClose };
};

export default useDisclosure;