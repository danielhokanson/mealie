import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ShoppingList, ShoppingListItem, MultiPurposeLabel } from '../models/shopping-list.model';
import { PaginationData } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class ShoppingListService {
    constructor(private api: ApiService) { }

    /**
     * Get all shopping lists
     */
    getAllShoppingLists(page = 1, perPage = 20, params: any = {}): Observable<PaginationData<ShoppingList>> {
        return this.api.get<PaginationData<ShoppingList>>('/shopping-lists', {
            page,
            perPage,
            ...params
        });
    }

    /**
     * Get shopping list by ID
     */
    getShoppingListById(id: string): Observable<ShoppingList> {
        return this.api.get<ShoppingList>(`/shopping-lists/${id}`);
    }

    /**
     * Create a new shopping list
     */
    createShoppingList(shoppingList: Partial<ShoppingList>): Observable<ShoppingList> {
        return this.api.post<ShoppingList>('/shopping-lists', shoppingList);
    }

    /**
     * Update a shopping list
     */
    updateShoppingList(id: string, shoppingList: Partial<ShoppingList>): Observable<ShoppingList> {
        return this.api.put<ShoppingList>(`/shopping-lists/${id}`, shoppingList);
    }

    /**
     * Delete a shopping list
     */
    deleteShoppingList(id: string): Observable<void> {
        return this.api.delete<void>(`/shopping-lists/${id}`);
    }

    /**
     * Add item to shopping list
     */
    addItemToShoppingList(listId: string, item: Partial<ShoppingListItem>): Observable<ShoppingListItem> {
        return this.api.post<ShoppingListItem>(`/shopping-lists/${listId}/items`, item);
    }

    /**
     * Update shopping list item
     */
    updateShoppingListItem(listId: string, itemId: string, item: Partial<ShoppingListItem>): Observable<ShoppingListItem> {
        return this.api.put<ShoppingListItem>(`/shopping-lists/${listId}/items/${itemId}`, item);
    }

    /**
     * Delete shopping list item
     */
    deleteShoppingListItem(listId: string, itemId: string): Observable<void> {
        return this.api.delete<void>(`/shopping-lists/${listId}/items/${itemId}`);
    }

    /**
     * Toggle item checked status
     */
    toggleItemChecked(listId: string, itemId: string, checked: boolean): Observable<ShoppingListItem> {
        return this.api.patch<ShoppingListItem>(`/shopping-lists/${listId}/items/${itemId}`, { checked });
    }

    /**
     * Add recipe to shopping list
     */
    addRecipeToShoppingList(listId: string, recipeSlug: string, scale?: number): Observable<ShoppingList> {
        return this.api.post<ShoppingList>(`/shopping-lists/${listId}/recipe`, {
            recipeSlug,
            scale: scale || 1
        });
    }

    /**
     * Get shopping list labels
     */
    getLabels(): Observable<MultiPurposeLabel[]> {
        return this.api.get<MultiPurposeLabel[]>('/shopping-lists/labels');
    }

    /**
     * Create a new label
     */
    createLabel(label: Partial<MultiPurposeLabel>): Observable<MultiPurposeLabel> {
        return this.api.post<MultiPurposeLabel>('/shopping-lists/labels', label);
    }

    /**
     * Update a label
     */
    updateLabel(id: string, label: Partial<MultiPurposeLabel>): Observable<MultiPurposeLabel> {
        return this.api.put<MultiPurposeLabel>(`/shopping-lists/labels/${id}`, label);
    }

    /**
     * Delete a label
     */
    deleteLabel(id: string): Observable<void> {
        return this.api.delete<void>(`/shopping-lists/labels/${id}`);
    }

    /**
     * Assign label to item
     */
    assignLabelToItem(listId: string, itemId: string, labelId: string): Observable<ShoppingListItem> {
        return this.api.patch<ShoppingListItem>(`/shopping-lists/${listId}/items/${itemId}`, {
            labelId
        });
    }

    /**
     * Remove label from item
     */
    removeLabelFromItem(listId: string, itemId: string): Observable<ShoppingListItem> {
        return this.api.patch<ShoppingListItem>(`/shopping-lists/${listId}/items/${itemId}`, {
            labelId: null
        });
    }

    /**
     * Clear all checked items
     */
    clearCheckedItems(listId: string): Observable<ShoppingList> {
        return this.api.delete<ShoppingList>(`/shopping-lists/${listId}/items/checked`);
    }

    /**
     * Duplicate shopping list
     */
    duplicateShoppingList(id: string): Observable<ShoppingList> {
        return this.api.post<ShoppingList>(`/shopping-lists/${id}/duplicate`, {});
    }

    /**
     * Get all foods
     */
    getAllFoods(page = 1, perPage = 50, params: any = {}): Observable<any> {
        return this.api.get<any>('/foods', {
            page,
            perPage,
            ...params
        });
    }

    /**
     * Get food by ID
     */
    getFoodById(id: string): Observable<any> {
        return this.api.get<any>(`/foods/${id}`);
    }

    /**
     * Create food
     */
    createFood(food: any): Observable<any> {
        return this.api.post<any>('/foods', food);
    }

    /**
     * Update food
     */
    updateFood(id: string, food: any): Observable<any> {
        return this.api.put<any>(`/foods/${id}`, food);
    }

    /**
     * Delete food
     */
    deleteFood(id: string): Observable<void> {
        return this.api.delete<void>(`/foods/${id}`);
    }

    /**
     * Get all units
     */
    getAllUnits(page = 1, perPage = 50, params: any = {}): Observable<any> {
        return this.api.get<any>('/units', {
            page,
            perPage,
            ...params
        });
    }

    /**
     * Get unit by ID
     */
    getUnitById(id: string): Observable<any> {
        return this.api.get<any>(`/units/${id}`);
    }

    /**
     * Create unit
     */
    createUnit(unit: any): Observable<any> {
        return this.api.post<any>('/units', unit);
    }

    /**
     * Update unit
     */
    updateUnit(id: string, unit: any): Observable<any> {
        return this.api.put<any>(`/units/${id}`, unit);
    }

    /**
     * Delete unit
     */
    deleteUnit(id: string): Observable<void> {
        return this.api.delete<void>(`/units/${id}`);
    }

    /**
     * Merge units
     */
    mergeUnits(fromUnitId: string, toUnitId: string): Observable<any> {
        return this.api.post<any>(`/units/${toUnitId}/merge`, { fromUnitId });
    }

    /**
     * Get food categories
     */
    getFoodCategories(): Observable<string[]> {
        return this.api.get<string[]>('/foods/categories');
    }

    /**
     * Search foods
     */
    searchFoods(query: string, limit = 10): Observable<any[]> {
        return this.api.get<any[]>('/foods/search', { q: query, limit });
    }
}