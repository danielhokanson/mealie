export interface PaginationData<T> {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    items: T[];
}

export interface PaginationParams {
    page?: number;
    perPage?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    search?: string;
}