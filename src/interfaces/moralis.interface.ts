export interface PairDataToken {
    address: string;
    symbol: string;
    name: string;
    block_number: string;
}

export interface PairData {
    token0: PairDataToken;
    token1: PairDataToken;
    pair: string;
}

export interface PaginatedResponse<T> {
    total: number;
    page: number;
    page_size: number;
    result: T[]
}

export interface Transfer {
    transaction_hash: string;
    address: string;
    block_timestamp: string;
    block_number: string;
    block_hash: string;
    to_address: string;
    from_address: string;
    value: string;
}
