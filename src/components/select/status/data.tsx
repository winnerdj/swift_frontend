
export type selectType = {
    label: string;
    value: string;
}

export type statusType = {
    status: selectType[],
    receive_mode: selectType[]
}

const status:selectType[] = [
    {
        label: 'Active',
        value: 'ACTIVE'
    },
    {
        label: 'In Active',
        value: 'INACTIVE'
    }
]

const receive_mode: selectType[] = [
    {
        label:'Barcode',
        value: '/pod-transaction/receive/barcode'
    },
    {
        label: 'Date Entry',
        value: '/pod-transaction/receive/data-entry'
    }
]


const statusList: statusType = {
    status,
    receive_mode
}



export default statusList;