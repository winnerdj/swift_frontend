import { useGetAvailableCounterSelectQuery } from '@/lib/redux/api/select.api';
import { ActionMeta, SingleValue } from 'react-select';
import Select from 'react-select/async';
import { selectType } from './types';
import React from 'react';

interface AvailableCounterSelectProps {
    id: string;
    type: string;
    service_id?: string; // This prop will control the fetch
    value: selectType | null;
    name?: string;
    placeholder?: string;
    onChange: (value: SingleValue<selectType> | null, action: ActionMeta<selectType>) => void;
    isClearable?: boolean;
    className?: string;
    isDisabled?: boolean; // Added for better UX, if you want to disable the select itself
}

const AvailableCounterSelect: React.FC<AvailableCounterSelectProps> = ({
    isClearable = true,
    className,
    service_id, // Destructure service_id from props
    isDisabled = false, // Default value for the new prop
    ...props
}) => {
    // The 'skip' property is exactly what you need.
    // It prevents the query from running if the condition is true.
    const { data, isLoading } = useGetAvailableCounterSelectQuery(
        {
            route: props.type,
            filters: { service_id: service_id }
        },
        {
            // Skip the query if 'service_id' is undefined, null, or an empty string.
            // This is the condition that controls whether the fetch happens.
            skip: !service_id,
            // By default, RTK Query refetches when arguments change.
            // Explicitly setting it to true ensures this behavior.
            refetchOnMountOrArgChange: true,
        }
    ) as { data?: { data: selectType[] } | selectType[]; isLoading: boolean };

    // Ensure `selectData` is always an array, even if `data` is undefined due to `skip`
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
        // No need for a setTimeout unless you specifically want to simulate network delay.
        // The data is already managed by RTK Query's `isLoading` and `data` states.
        callback(filterData(value));
    };

    // Use React.useMemo to ensure defaultOptions is stable and only re-calculated
    // when selectData actually changes.
    const defaultOptions = React.useMemo(() => selectData.slice(0, 100), [selectData]);

    return (
        <Select
            cacheOptions
            loadOptions={loadOptions}
            // Pass the memoized defaultOptions
            defaultOptions={defaultOptions}
            name={props.name}
            onChange={props.onChange}
            value={props.value}
            placeholder={props.placeholder}
            isClearable={isClearable}
            // The loading state should reflect the RTK Query's isLoading
            isLoading={isLoading}
            className={className}
            // Disable the select if no service_id is provided, or if explicitly set to disabled
            isDisabled={isDisabled || !service_id}
        />
    );
}

export default AvailableCounterSelect;