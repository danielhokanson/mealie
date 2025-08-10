import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, takeUntil, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ShoppingListItem, MultiPurposeLabel } from '../../../../core/models/shopping-list.model';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';

@Component({
    selector: 'app-shopping-list-item-editor',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatChipsModule,
        MatListModule,
        MatDividerModule,
        MatMenuModule,
        MatTooltipModule,
        MatExpansionModule,
        MatAutocompleteModule
    ],
    templateUrl: './shopping-list-item-editor.component.html',
    styleUrls: ['./shopping-list-item-editor.component.scss']
})
export class ShoppingListItemEditorComponent implements OnInit, OnDestroy {
    @Input() item: ShoppingListItem | null = null;
    @Input() labels: MultiPurposeLabel[] = [];
    @Input() units: any[] = [];
    @Input() foods: any[] = [];
    @Input() isEditing = false;

    @Output() save = new EventEmitter<ShoppingListItem>();
    @Output() cancel = new EventEmitter<void>();
    @Output() delete = new EventEmitter<string>();

    loading = false;
    itemForm: FormGroup;
    filteredFoods: Observable<any[]> = [];
    filteredLabels: Observable<MultiPurposeLabel[]> = [];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private shoppingListService: ShoppingListService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.setupFormFilters();
        if (this.item) {
            this.populateForm();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.itemForm = this.fb.group({
            note: ['', [Validators.maxLength(500)]],
            quantity: [1, [Validators.required, Validators.min(0.01)]],
            unit: [''],
            food: [''],
            labels: [[]],
            isChecked: [false],
            price: [null, [Validators.min(0)]],
            category: [''],
            priority: ['medium']
        });
    }

    private setupFormFilters(): void {
        // Setup food autocomplete
        this.filteredFoods = this.itemForm.get('food')!.valueChanges.pipe(
            startWith(''),
            map(value => this.filterFoods(value))
        );

        // Setup labels autocomplete
        this.filteredLabels = this.itemForm.get('labels')!.valueChanges.pipe(
            startWith(''),
            map(value => this.filterLabels(value))
        );
    }

    private populateForm(): void {
        if (this.item) {
            this.itemForm.patchValue({
                note: this.item.note || '',
                quantity: this.item.quantity || 1,
                unit: this.item.unit || '',
                food: this.item.food || '',
                labels: this.item.labels || [],
                isChecked: this.item.isChecked || false,
                price: this.item.price || null,
                category: this.item.category || '',
                priority: this.item.priority || 'medium'
            });
        }
    }

    private filterFoods(value: string): any[] {
        const filterValue = value.toLowerCase();
        return this.foods.filter(food =>
            food.name.toLowerCase().includes(filterValue)
        );
    }

    private filterLabels(value: any): MultiPurposeLabel[] {
        if (typeof value === 'string') {
            const filterValue = value.toLowerCase();
            return this.labels.filter(label =>
                label.name.toLowerCase().includes(filterValue)
            );
        }
        return this.labels;
    }

    onSave(): void {
        if (this.itemForm.valid) {
            this.loading = true;
            const formData = this.itemForm.value;

            const updatedItem: ShoppingListItem = {
                id: this.item?.id || Date.now().toString(),
                note: formData.note,
                quantity: formData.quantity,
                unit: formData.unit,
                food: formData.food,
                labels: formData.labels,
                isChecked: formData.isChecked,
                price: formData.price,
                category: formData.category,
                priority: formData.priority,
                shoppingListId: this.item?.shoppingListId || '',
                createdAt: this.item?.createdAt || new Date(),
                updatedAt: new Date()
            };

            if (this.isEditing && this.item) {
                this.shoppingListService.updateShoppingListItem(this.item.shoppingListId, this.item.id, updatedItem)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (item) => {
                            this.loading = false;
                            this.save.emit(item);
                            this.snackBar.open('Item updated successfully', 'Close', { duration: 3000 });
                        },
                        error: (error) => {
                            console.error('Error updating item:', error);
                            this.loading = false;
                            this.snackBar.open('Error updating item. Please try again.', 'Close', { duration: 3000 });
                        }
                    });
            } else {
                this.shoppingListService.addItemToShoppingList(updatedItem.shoppingListId, updatedItem)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (item) => {
                            this.loading = false;
                            this.save.emit(item);
                            this.snackBar.open('Item added successfully', 'Close', { duration: 3000 });
                        },
                        error: (error) => {
                            console.error('Error adding item:', error);
                            this.loading = false;
                            this.snackBar.open('Error adding item. Please try again.', 'Close', { duration: 3000 });
                        }
                    });
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }

    onDelete(): void {
        if (this.item && confirm('Are you sure you want to delete this item?')) {
            this.loading = true;

            this.shoppingListService.deleteShoppingListItem(this.item.shoppingListId, this.item.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loading = false;
                        this.delete.emit(this.item!.id);
                        this.snackBar.open('Item deleted successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error deleting item:', error);
                        this.loading = false;
                        this.snackBar.open('Error deleting item. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        }
    }

    onAddLabel(label: MultiPurposeLabel): void {
        const currentLabels = this.itemForm.get('labels')?.value || [];
        if (!currentLabels.find((l: MultiPurposeLabel) => l.id === label.id)) {
            this.itemForm.patchValue({
                labels: [...currentLabels, label]
            });
        }
    }

    onRemoveLabel(labelId: string): void {
        const currentLabels = this.itemForm.get('labels')?.value || [];
        const updatedLabels = currentLabels.filter((l: MultiPurposeLabel) => l.id !== labelId);
        this.itemForm.patchValue({ labels: updatedLabels });
    }

    onFoodSelected(food: any): void {
        this.itemForm.patchValue({ food: food.name });
    }

    onLabelSelected(label: MultiPurposeLabel): void {
        this.onAddLabel(label);
    }

    getDisplayName(item: any): string {
        return item ? item.name : '';
    }

    getLabelDisplayName(label: MultiPurposeLabel): string {
        return label ? label.name : '';
    }

    getErrorMessage(fieldName: string): string {
        const field = this.itemForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('min')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['min'].min}`;
        }
        if (field?.hasError('maxlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${field?.errors?.['maxlength'].requiredLength} characters`;
        }
        return '';
    }

    getPriorityColor(priority: string): string {
        switch (priority) {
            case 'high':
                return '#f44336';
            case 'medium':
                return '#ff9800';
            case 'low':
                return '#4caf50';
            default:
                return '#666';
        }
    }

    getPriorityIcon(priority: string): string {
        switch (priority) {
            case 'high':
                return 'priority_high';
            case 'medium':
                return 'remove';
            case 'low':
                return 'low_priority';
            default:
                return 'remove';
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.itemForm.controls).forEach(key => {
            const control = this.itemForm.get(key);
            control?.markAsTouched();
        });
    }

    canSave(): boolean {
        return this.itemForm.valid && !this.loading;
    }

    canDelete(): boolean {
        return this.item !== null && !this.loading;
    }

    getNoteLength(): number {
        const note = this.itemForm.get('note')?.value || '';
        return note.length;
    }

    getMaxNoteLength(): number {
        return 500;
    }
} 