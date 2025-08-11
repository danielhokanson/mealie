import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';
import { ShoppingList, ShoppingListItem, MultiPurposeLabel } from '../../../../core/models/shopping-list.model';

@Component({
    selector: 'app-shopping-list-detail',
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
        MatListModule,
        MatDividerModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatExpansionModule,
        MatBadgeModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './shopping-list-detail.component.html',
    styleUrls: ['./shopping-list-detail.component.scss']
})
export class ShoppingListDetailComponent implements OnInit, OnDestroy {
    shoppingList: ShoppingList | null = null;
    loading = true;
    error = false;
    labels: MultiPurposeLabel[] = [];
    showAddItem = false;
    newItemForm: FormGroup;
    selectedLabels: string[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private shoppingListService: ShoppingListService,
        private snackBar: MatSnackBar,
        private fb: FormBuilder
    ) {
        this.newItemForm = this.fb.group({
            title: ['', [Validators.required]],
            quantity: [1, [Validators.required, Validators.min(0)]],
            unit: [''],
            note: [''],
            labelIds: [[]]
        });
    }

    ngOnInit(): void {
        const listId = this.route.snapshot.paramMap.get('id');
        if (listId) {
            this.loadShoppingList(listId);
            this.loadLabels();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public loadShoppingList(listId: string): void {
        this.loading = true;
        this.error = false;

        this.shoppingListService.getShoppingList(listId).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (list: ShoppingList) => {
                this.shoppingList = list;
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading shopping list:', error);
                this.error = true;
                this.loading = false;
            }
        });
    }

    private loadLabels(): void {
        this.shoppingListService.getLabels().pipe(
            takeUntil(this.destroy$)
        ).subscribe(labels => {
            this.labels = labels;
        });
    }

    onToggleItem(item: ShoppingListItem): void {
        const updatedItem = { ...item, checked: !item.checked };

        this.shoppingListService.updateShoppingListItem(
            this.shoppingList!.id,
            item.id,
            updatedItem
        ).subscribe({
            next: (updatedItem) => {
                // Update the item in the local list
                const index = this.shoppingList!.items.findIndex(i => i.id === item.id);
                if (index !== -1) {
                    this.shoppingList!.items[index] = updatedItem;
                }
            },
            error: (error) => {
                console.error('Error updating item:', error);
                this.snackBar.open('Failed to update item', 'Close', {
                    duration: 3000
                });
            }
        });
    }

    onDeleteItem(item: ShoppingListItem): void {
        if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
            this.shoppingListService.deleteShoppingListItem(
                this.shoppingList!.id,
                item.id
            ).subscribe({
                next: () => {
                    this.shoppingList!.items = this.shoppingList!.items.filter(i => i.id !== item.id);
                    this.snackBar.open('Item deleted successfully', 'Close', {
                        duration: 2000
                    });
                },
                error: (error) => {
                    console.error('Error deleting item:', error);
                    this.snackBar.open('Failed to delete item', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }

    onAddItem(): void {
        if (this.newItemForm.valid) {
            const newItem = {
                ...this.newItemForm.value,
                labelIds: this.selectedLabels
            };

            this.shoppingListService.createShoppingListItem(
                this.shoppingList!.id,
                newItem
            ).subscribe({
                            next: (item: ShoppingListItem) => {
                this.shoppingList!.items.push(item);
                this.newItemForm.reset();
                this.selectedLabels = [];
                this.showAddItem = false;
                this.snackBar.open('Item added successfully', 'Close', {
                    duration: 2000
                });
            },
            error: (error: any) => {
                console.error('Error adding item:', error);
                this.snackBar.open('Failed to add item', 'Close', {
                    duration: 3000
                });
            }
            });
        }
    }

    onLabelToggle(labelId: string): void {
        const index = this.selectedLabels.indexOf(labelId);
        if (index > -1) {
            this.selectedLabels.splice(index, 1);
        } else {
            this.selectedLabels.push(labelId);
        }
    }

    onEditList(): void {
        this.router.navigate(['/shopping-lists', this.shoppingList!.id, 'edit']);
    }

    onDeleteList(): void {
        if (confirm(`Are you sure you want to delete "${this.shoppingList!.name}"?`)) {
            this.shoppingListService.deleteShoppingList(this.shoppingList!.id).subscribe({
                next: () => {
                    this.snackBar.open('Shopping list deleted successfully', 'Close', {
                        duration: 3000
                    });
                    this.router.navigate(['/shopping-lists']);
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

    onShareList(): void {
        // Generate a shareable link
        const shareUrl = `${window.location.origin}/shopping-lists/${this.shoppingList!.id}/shared`;
        
        if (navigator.share) {
            // Use Web Share API if available
            navigator.share({
                title: `Shopping List: ${this.shoppingList?.name}`,
                text: `Check out my shopping list: ${this.shoppingList?.name}`,
                url: shareUrl
            }).catch((error) => {
                console.log('Error sharing:', error);
                // Fallback to clipboard
                this.copyToClipboard(shareUrl);
            });
        } else {
            // Fallback to clipboard
            this.copyToClipboard(shareUrl);
        }
    }

    private copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text).then(() => {
            this.snackBar.open('Share link copied to clipboard!', 'Close', {
                duration: 3000
            });
        }).catch(() => {
            this.snackBar.open('Failed to copy link', 'Close', {
                duration: 3000
            });
        });
    }

    onPrintList(): void {
        window.open(`/shopping-lists/${this.shoppingList!.id}/print`, '_blank');
    }

    getCompletedItemsCount(): number {
        return this.shoppingList?.items?.filter(item => item.checked).length || 0;
    }

    getTotalItemsCount(): number {
        return this.shoppingList?.items?.length || 0;
    }

    getProgressPercentage(): number {
        const total = this.getTotalItemsCount();
        if (total === 0) return 0;
        return (this.getCompletedItemsCount() / total) * 100;
    }

    getFormattedDate(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getLabelColor(labelId: string): string {
        const label = this.labels.find(l => l.id === labelId);
        return label?.color || '#ccc';
    }

    getLabelName(labelId: string): string {
        const label = this.labels.find(l => l.id === labelId);
        return label?.name || labelId;
    }

    getItemsByLabel(labelId: string): ShoppingListItem[] {
        return this.shoppingList?.items?.filter(item =>
            item.labels?.some(label => label.id === labelId)
        ) || [];
    }

    getUnlabeledItems(): ShoppingListItem[] {
        return this.shoppingList?.items?.filter(item =>
            !item.labels || item.labels.length === 0
        ) || [];
    }

    getUniqueLabels(): MultiPurposeLabel[] {
        const allLabels = this.shoppingList?.items?.flatMap(item => item.labels || []) || [];
        const uniqueLabels = allLabels.filter((label, index, self) =>
            index === self.findIndex(l => l.id === label.id)
        );
        return uniqueLabels;
    }
} 