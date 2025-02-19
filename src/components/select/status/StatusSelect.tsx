import React from 'react'
import Select, { ActionMeta, SingleValue } from 'react-select';
import data,{statusType, selectType} from './data';

export interface StatusSelectProps {
    name?: string;
    value?: selectType | null;
    type: keyof statusType;
    placeholder?: string;
    onChange: (value: SingleValue<selectType> | null, action: ActionMeta<selectType>) => void;
    isClearable?: boolean;
}

const StatusSelect: React.FC<StatusSelectProps> = ({
    isClearable=true,
    ...props
}) => {
    return <Select
        options={data[props.type]}
        name={props.name}
        onChange={props.onChange}
        value={props.value}
        placeholder={props.placeholder}
        isClearable={isClearable}
    />;
}

export default StatusSelect