import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { ShoppingListItemComponent, ShoppingListItem, MultiPurposeLabel, IngredientUnit, IngredientFood } from '../shopping-list-item/shopping-list-item.component';
import { RecipeSummary } from '../../../recipes/components/recipe-list/recipe-list.component';

export interface ShoppingList {
    id: string;
    name: string;
    description?: string;
    items: ShoppingListItem[];
    groupId: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

@Component({
    selector: 'app-shopping-list',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatChipsModule,
        ShoppingListItemComponent
    ],
    templateUrl: './shopping-list.component.html',
    styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent {
    @Input() shoppingList!: ShoppingList;
    @Input() labels: MultiPurposeLabel[] = [];
    @Input() units: IngredientUnit[] = [];
    @Input() foods: IngredientFood[] = [];
    @Input() recipes = new Map<string, RecipeSummary>();
    @Input() showLabels = false;

    @Output() itemChecked = new EventEmitter<ShoppingListItem>();
    @Output() itemUpdated = new EventEmitter<ShoppingListItem>();
    @Output() itemDeleted = new EventEmitter<string>();
    @Output() listDeleted = new EventEmitter<string>();

    get checkedItems(): ShoppingListItem[] {
        return this.shoppingList.items.filter(item => item.checked);
    }

    get uncheckedItems(): ShoppingListItem[] {
        return this.shoppingList.items.filter(item => !item.checked);
    }

    get progressPercentage(): number {
        if (this.shoppingList.items.length === 0) return 0;
        return (this.checkedItems.length / this.shoppingList.items.length) * 100;
    }

    onItemChecked(item: ShoppingListItem): void {
        this.itemChecked.emit(item);
    }

    onItemUpdated(item: ShoppingListItem): void {
        this.itemUpdated.emit(item);
    }

    onItemDeleted(itemId: string): void {
        this.itemDeleted.emit(itemId);
    }

    onDeleteList(): void {
        this.listDeleted.emit(this.shoppingList.id);
    }

    addItem(): void {
        const newItem: ShoppingListItem = {
            id: Date.now().toString(),
            name: '',
            quantity: 1,
            checked: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.shoppingList.items.unshift(newItem);
    }

    clearCompleted(): void {
        this.shoppingList.items = this.shoppingList.items.filter(item => !item.checked);
    }

    trackByItemId(index: number, item: ShoppingListItem): string {
        return item.id;
    }
} 