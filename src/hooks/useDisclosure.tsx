import React from 'react';

const useDisclosure = () => {
    const [state,setState] = React.useState<boolean>(false);

    const open = state;
    const onClose = () => setState(false)
    const onOpen = () => setState(true)

    return {open, onClose, onOpen}
}

export default useDisclosure;