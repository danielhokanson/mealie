export interface ShoppingList {
    id: string;
    name: string;
    description?: string;
    groupId: string;
    householdId?: string;
    createdAt: Date;
    updatedAt: Date;
    items: ShoppingListItem[];
}

export interface ShoppingListItem {
    id: string;
    title: string;
    note?: string;
    quantity: number;
    unit?: string;
    food?: string;
    checked: boolean;
    shoppingListId: string;
    labelId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MultiPurposeLabel {
    id: string;
    name: string;
    color: string;
    groupId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ShoppingListQueue {
    create: ShoppingListItem[];
    update: ShoppingListItem[];
    delete: ShoppingListItem[];
    lastUpdate: number;
}

export interface ShoppingListSearchParams {
    search?: string;
    labels?: string[];
    checked?: boolean;
    page?: number;
    perPage?: number;
} 