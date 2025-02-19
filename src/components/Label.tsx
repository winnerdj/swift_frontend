import React from 'react'

interface LabelProps {
    label:string;
    value?: string | null;
}

const Label: React.FC<LabelProps> = (props) => {
    return <div >
        <h4 className='text-lg font-bold'>{props.label}</h4>
        <p className='text-md font-semibold'>{props.value}</p>
    </div>;
}

export default Label