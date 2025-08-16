export interface ShareRecipeOptions {
    method: 'email' | 'link' | 'social';
    recipients?: string[];
    message?: string;
    includeImage?: boolean;
    includeNutrition?: boolean;
}

export interface ShareResult {
    success: boolean;
    message: string;
    shareUrl?: string;
}

export interface RecipeRating {
    id?: string;
    rating: number;
    userId: string;
    comment?: string;
    createdAt?: Date;
}

export interface CreateShoppingListItem {
    title: string;
    note?: string;
    quantity: number;
    unit?: string;
    food?: string;
    labelIds?: string[];
}

export interface InviteMemberData {
    email: string;
    role: 'admin' | 'member' | 'viewer';
    message?: string;
}

export interface InviteResult {
    success: boolean;
    message: string;
    invitationId?: string;
}

export interface PaginationData<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
