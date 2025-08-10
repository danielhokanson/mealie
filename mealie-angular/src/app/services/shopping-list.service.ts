import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShoppingList } from '../features/shopping-lists/components/shopping-list/shopping-list.component';
import { ShoppingListItem } from '../features/shopping-lists/components/shopping-list-item/shopping-list-item.component';
import { MultiPurposeLabel } from '../features/shopping-lists/components/shopping-list-item/shopping-list-item.component';

@Injectable({
    providedIn: 'root'
})
export class ShoppingListService {
    private apiUrl = 'http://localhost:5000/api'; // .NET backend URL

    constructor(private http: HttpClient) { }

    // Shopping Lists
    getShoppingLists(): Observable<ShoppingList[]> {
        return this.http.get<ShoppingList[]>(`${this.apiUrl}/shopping-lists`);
    }

    getShoppingList(id: string): Observable<ShoppingList> {
        return this.http.get<ShoppingList>(`${this.apiUrl}/shopping-lists/${id}`);
    }

    createShoppingList(shoppingList: Partial<ShoppingList>): Observable<ShoppingList> {
        return this.http.post<ShoppingList>(`${this.apiUrl}/shopping-lists`, shoppingList);
    }

    updateShoppingList(id: string, shoppingList: Partial<ShoppingList>): Observable<ShoppingList> {
        return this.http.put<ShoppingList>(`${this.apiUrl}/shopping-lists/${id}`, shoppingList);
    }

    deleteShoppingList(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/shopping-lists/${id}`);
    }

    // Shopping List Items
    getShoppingListItems(listId: string): Observable<ShoppingListItem[]> {
        return this.http.get<ShoppingListItem[]>(`${this.apiUrl}/shopping-lists/${listId}/items`);
    }

    createShoppingListItem(listId: string, item: Partial<ShoppingListItem>): Observable<ShoppingListItem> {
        return this.http.post<ShoppingListItem>(`${this.apiUrl}/shopping-lists/${listId}/items`, item);
    }

    updateShoppingListItem(listId: string, itemId: string, item: Partial<ShoppingListItem>): Observable<ShoppingListItem> {
        return this.http.put<ShoppingListItem>(`${this.apiUrl}/shopping-lists/${listId}/items/${itemId}`, item);
    }

    deleteShoppingListItem(listId: string, itemId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/shopping-lists/${listId}/items/${itemId}`);
    }

    // Labels
    getLabels(): Observable<MultiPurposeLabel[]> {
        return this.http.get<MultiPurposeLabel[]>(`${this.apiUrl}/labels`);
    }

    createLabel(label: Partial<MultiPurposeLabel>): Observable<MultiPurposeLabel> {
        return this.http.post<MultiPurposeLabel>(`${this.apiUrl}/labels`, label);
    }

    updateLabel(id: string, label: Partial<MultiPurposeLabel>): Observable<MultiPurposeLabel> {
        return this.http.put<MultiPurposeLabel>(`${this.apiUrl}/labels/${id}`, label);
    }

    deleteLabel(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/labels/${id}`);
    }

    // Units
    getUnits(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/units`);
    }

    // Foods
    getFoods(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/foods`);
    }
} 