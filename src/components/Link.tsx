import React from 'react'
import {Link as RLink, useLocation} from 'react-router-dom';

interface LinkProps {
    label:string;
    path:string;
}

const Link: React.FC<LinkProps> = (props) => {
    const location = useLocation();

    return <RLink className={`font-sans text-gray-600 text-md ${location.pathname === props.path ? 'font-semibold': ''}`} to={props.path}>
        {props.label}
    </RLink>;
}

export default Link