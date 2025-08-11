import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';
import { ShoppingList } from '../../../../core/models/shopping-list.model';
import { PaginationData } from '../../../../core/models/pagination.model';

@Component({
    selector: 'app-shopping-lists',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatDialogModule,
        MatListModule,
        MatDividerModule,
        MatBadgeModule
    ],
    templateUrl: './shopping-lists.component.html',
    styleUrls: ['./shopping-lists.component.scss']
})
export class ShoppingListsComponent implements OnInit, OnDestroy {
    shoppingLists: ShoppingList[] = [];
    loading = true;
    error = false;

    private destroy$ = new Subject<void>();

    constructor(
        private shoppingListService: ShoppingListService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadShoppingLists();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public loadShoppingLists(): void {
        this.loading = true;
        this.error = false;

        this.shoppingListService.getShoppingLists().pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (response: PaginationData<ShoppingList>) => {
                this.shoppingLists = response.items || [];
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading shopping lists:', error);
                this.error = true;
                this.loading = false;
            }
        });
    }

    onCreateList(): void {
        this.router.navigate(['/shopping-lists/create']);
    }

    onViewList(list: ShoppingList): void {
        this.router.navigate(['/shopping-lists', list.id]);
    }

    onEditList(list: ShoppingList): void {
        // TODO: Implement edit functionality
        this.snackBar.open('Edit functionality coming soon', 'Close', {
            duration: 2000
        });
    }

    onDeleteList(list: ShoppingList): void {
        if (confirm(`Are you sure you want to delete "${list.name}"?`)) {
            this.shoppingListService.deleteShoppingList(list.id).subscribe({
                next: () => {
                    this.shoppingLists = this.shoppingLists.filter(l => l.id !== list.id);
                    this.snackBar.open('Shopping list deleted successfully', 'Close', {
                        duration: 3000
                    });
                },
                error: (error) => {
                    console.error('Error deleting shopping list:', error);
                    this.snackBar.open('Failed to delete shopping list', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }

    onShareList(list: ShoppingList): void {
        // TODO: Implement share functionality
        this.snackBar.open('Share functionality coming soon', 'Close', {
            duration: 2000
        });
    }

    onPrintList(list: ShoppingList): void {
        window.open(`/shopping-lists/${list.id}/print`, '_blank');
    }

    getCompletedItemsCount(list: ShoppingList): number {
        return list.items?.filter(item => item.checked).length || 0;
    }

    getTotalItemsCount(list: ShoppingList): number {
        return list.items?.length || 0;
    }

    getProgressPercentage(list: ShoppingList): number {
        const total = this.getTotalItemsCount(list);
        if (total === 0) return 0;
        return (this.getCompletedItemsCount(list) / total) * 100;
    }

    getFormattedDate(date: Date | string): string {
        if (typeof date === 'string') {
            return new Date(date).toLocaleDateString();
        }
        return date.toLocaleDateString();
    }

    getLabelColor(labelId: string): string {
        const label = this.shoppingLists
            .flatMap(list => list.items || [])
            .flatMap(item => item.labels || [])
            .find(l => l.id === labelId);
        return label?.color || '#ccc';
    }

    getUniqueLabels(list: ShoppingList): any[] {
        const allLabels = list.items?.flatMap(item => item.labels || []) || [];
        const uniqueLabels = allLabels.filter((label, index, self) =>
            index === self.findIndex(l => l.id === label.id)
        );
        return uniqueLabels;
    }

    hasLabels(list: ShoppingList): boolean {
        return list.items && list.items.some(item => item.labels && item.labels.length > 0);
    }
} 