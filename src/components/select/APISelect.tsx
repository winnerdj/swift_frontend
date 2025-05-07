import { useGetSelectDataQuery, routes } from '@/lib/redux/api/select.api';
import { ActionMeta, SingleValue } from 'react-select';
import Select from 'react-select/async';
import { selectType } from './types';
import React from 'react';

interface APISelectProps {
    id: string;
    type: routes;
    qc_type?: string;
    value: selectType | null;
    name?: string;
    placeholder?: string;
    onChange: (value: SingleValue<selectType> | null, action: ActionMeta<selectType>) => void;
    isClearable?: boolean;
    className?: string;
}

const APISelect: React.FC<APISelectProps> = ({ isClearable = true, className, ...props }) => {
    const { data, isLoading } = useGetSelectDataQuery({
        route: props.type,
        filters: { qc_type: props.qc_type }
    }) as { data?: { data: selectType[] } | selectType[]; isLoading: boolean };

    const selectData = Array.isArray(data) ? data : (data?.data ?? []);

    const filterData = (value: string) => {
        return selectData.filter((i: selectType) =>
            i.label.toLowerCase().includes(value.toLowerCase())
        );
    };

    const loadOptions = (
        value: string,
        callback: (options: selectType[]) => void
    ) => {
        setTimeout(() => {
            callback(filterData(value));
        }, 1000);
    };

    const defaultOptions = () => selectData.slice(0, 100);

    return (
        <Select
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions={defaultOptions()}
            name={props.name}
            onChange={props.onChange}
            value={props.value}
            placeholder={props.placeholder}
            isClearable={isClearable}
            isLoading={isLoading}
            className={className}
        />
    );
}

export default APISelect;