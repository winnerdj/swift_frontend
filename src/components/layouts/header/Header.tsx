import React from 'react'
import AccountComboBox from './AccountComboBox';

interface headerProps {
    children: React.ReactNode
}

const Header: React.FC<headerProps> = (props) => {
    return <div className='grid auto-rows-min grid-cols-1 grid-rows-1 items-center border border-l-0 border-b-1 px-5 h-16'
    >
        <div className='flex'>
            <div className='flex-1 flex items-center gap-2'>
                {props.children}
            </div>
            <div className='flex justify-end'>
                <AccountComboBox/>
            </div>
        </div>
      
    </div>;
}

export default Header