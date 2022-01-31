export interface Filter {
    id: string | number;
    name: string;
}

export const emptyFilterValue: Filter = {
    id: '',
    name: ''
}
export const sortFilterValues: Filter[] = [
    {
        id: 'default asc',
        name: 'Default'
    },
    {
        id: 'tvl dsc',
        name: 'TVL Highest'
    },
    {
        id: 'tvl asc',
        name: 'TVL Lowest'
    },
    {
        id: 'apr dsc',
        name: 'APR Highest'
    },
    {
        id: 'apr asc',
        name: 'APR Lowest'
    },
    {
        id: 'apy dsc',
        name: 'APY Highest'
    },
    {
        id: 'apy asc',
        name: 'APY Lowest'
    },
]
