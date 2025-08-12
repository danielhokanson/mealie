import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShoppingListComponent, ShoppingList } from '../../features/shopping-lists/components/shopping-list/shopping-list.component';
import { ShoppingListItem } from '../../features/shopping-lists/components/shopping-list-item/shopping-list-item.component';
import { MultiPurposeLabel, IngredientUnit, IngredientFood } from '../../features/shopping-lists/components/shopping-list-item/shopping-list-item.component';
import { RecipeSummary } from '../../features/recipes/components/recipe-list/recipe-list.component';
import { ShoppingListService } from '../../services/shopping-list.service';
import { SkeletonLoaderComponent } from '../../shared/components/ui/skeleton-loader/skeleton-loader.component';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-shopping-lists',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        ShoppingListComponent,
        SkeletonLoaderComponent
    ],
    templateUrl: './shopping-lists.component.html',
    styleUrls: ['./shopping-lists.component.scss']
})
export class ShoppingListsComponent implements OnInit {
    shoppingLists: ShoppingList[] = [];
    labels: MultiPurposeLabel[] = [];
    units: IngredientUnit[] = [];
    foods: IngredientFood[] = [];
    recipes = new Map<string, RecipeSummary>();

    loading = false;
    error: string | null = null;

    constructor(
        private shoppingListService: ShoppingListService,
        private snackBar: MatSnackBar,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.error = null;

        // Load shopping lists
        this.shoppingListService.getShoppingLists().subscribe({
            next: (lists) => {
                this.shoppingLists = lists;
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Failed to load shopping lists';
                this.loading = false;
                this.showError('Failed to load shopping lists');
            }
        });

        // Load labels
        this.shoppingListService.getLabels().subscribe({
            next: (labels) => {
                this.labels = labels;
            },
            error: (error) => {
                console.error('Failed to load labels:', error);
            }
        });

        // Load units
        this.shoppingListService.getUnits().subscribe({
            next: (units) => {
                this.units = units;
            },
            error: (error) => {
                console.error('Failed to load units:', error);
            }
        });

        // Load foods
        this.shoppingListService.getFoods().subscribe({
            next: (foods) => {
                this.foods = foods;
            },
            error: (error) => {
                console.error('Failed to load foods:', error);
            }
        });
    }

    onItemChecked(item: ShoppingListItem): void {
        // Update item in backend
        const list = this.shoppingLists.find(l => l.items.some(i => i.id === item.id));
        if (list) {
            this.shoppingListService.updateShoppingListItem(list.id, item.id, item).subscribe({
                next: () => {
                    this.showSuccess('Item updated successfully');
                },
                error: (error) => {
                    this.showError('Failed to update item');
                }
            });
        }
    }

    onItemUpdated(item: ShoppingListItem): void {
        // Update item in backend
        const list = this.shoppingLists.find(l => l.items.some(i => i.id === item.id));
        if (list) {
            this.shoppingListService.updateShoppingListItem(list.id, item.id, item).subscribe({
                next: () => {
                    this.showSuccess('Item updated successfully');
                },
                error: (error) => {
                    this.showError('Failed to update item');
                }
            });
        }
    }

    onItemDeleted(itemId: string): void {
        // Delete item from backend
        const list = this.shoppingLists.find(l => l.items.some(i => i.id === itemId));
        if (list) {
            this.shoppingListService.deleteShoppingListItem(list.id, itemId).subscribe({
                next: () => {
                    // Remove item from local array
                    list.items = list.items.filter(i => i.id !== itemId);
                    this.showSuccess('Item deleted successfully');
                },
                error: (error) => {
                    this.showError('Failed to delete item');
                }
            });
        }
    }

    onListDeleted(listId: string): void {
        // Delete list from backend
        this.shoppingListService.deleteShoppingList(listId).subscribe({
            next: () => {
                // Remove list from local array
                this.shoppingLists = this.shoppingLists.filter(l => l.id !== listId);
                this.showSuccess('Shopping list deleted successfully');
            },
            error: (error) => {
                this.showError('Failed to delete shopping list');
            }
        });
    }

    createNewList(): void {
        const newList: Partial<ShoppingList> = {
            name: 'New Shopping List',
            description: '',
            items: [],
            groupId: '1' // Default group ID
        };

        this.shoppingListService.createShoppingList(newList).subscribe({
            next: (list) => {
                this.shoppingLists.unshift(list);
                this.showSuccess('Shopping list created successfully');
            },
            error: (error) => {
                this.showError('Failed to create shopping list');
            }
        });
    }

    private showSuccess(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
        });
    }

    private showError(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
        });
    }

    trackByListId(index: number, list: ShoppingList): string {
        return list.id;
    }
} 