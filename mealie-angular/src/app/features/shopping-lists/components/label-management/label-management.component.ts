import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { MultiPurposeLabel } from '../../../../core/models/shopping-list.model';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';

@Component({
    selector: 'app-label-management',
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
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
    ],
    templateUrl: './label-management.component.html',
    styleUrls: ['./label-management.component.scss']
})
export class LabelManagementComponent implements OnInit, OnDestroy {
    loading = false;
    labels: MultiPurposeLabel[] = [];
    labelForm: FormGroup;
    showAddLabel = false;
    editingLabel: MultiPurposeLabel | null = null;
    selectedLabels: string[] = [];
    searchTerm = '';

    displayedColumns: string[] = ['select', 'name', 'color', 'description', 'usage', 'actions'];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private shoppingListService: ShoppingListService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadLabels();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.labelForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(50)]],
            color: ['#1976d2', [Validators.required, Validators.pattern('^#[0-9A-Fa-f]{6}$')]],
            description: ['', [Validators.maxLength(200)]]
        });
    }

    private loadLabels(): void {
        this.loading = true;

        this.shoppingListService.getLabels()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (labels) => {
                    this.labels = labels;
                    this.filteredLabels = [...this.labels];
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading labels:', error);
                    this.snackBar.open('Error loading labels', 'Close', { duration: 3000 });
                    this.loading = false;
                    // Fallback to sample data for development
                    setTimeout(() => {
                        this.labels = [
                            {
                                id: '1',
                                name: 'Urgent',
                                color: '#f44336',
                                description: 'High priority items that need immediate attention',
                                usageCount: 15,
                                createdAt: new Date('2024-01-01'),
                                updatedAt: new Date('2024-01-15')
                            },
                            {
                                id: '2',
                                name: 'Organic',
                                color: '#4caf50',
                                description: 'Organic and natural products',
                                usageCount: 8,
                                createdAt: new Date('2024-01-02'),
                                updatedAt: new Date('2024-01-10')
                            },
                            {
                                id: '3',
                                name: 'Sale',
                                color: '#ff9800',
                                description: 'Items on sale or with discounts',
                                usageCount: 12,
                                createdAt: new Date('2024-01-03'),
                                updatedAt: new Date('2024-01-12')
                            },
                            {
                                id: '4',
                                name: 'Bulk',
                                color: '#9c27b0',
                                description: 'Items to buy in bulk',
                                usageCount: 5,
                                createdAt: new Date('2024-01-04'),
                                updatedAt: new Date('2024-01-08')
                            },
                            {
                                id: '5',
                                name: 'Frozen',
                                color: '#2196f3',
                                description: 'Frozen food items',
                                usageCount: 20,
                                createdAt: new Date('2024-01-05'),
                                updatedAt: new Date('2024-01-14')
                            }
                        ];
                        this.loading = false;
                    }, 500);
                }

    onAddLabel(): void {
                    this.editingLabel = null;
                    this.labelForm.reset();
                    this.labelForm.patchValue({
                        name: '',
                        color: '#1976d2',
                        description: ''
                    });
                    this.showAddLabel = true;
                }

    onEditLabel(label: MultiPurposeLabel): void {
                    this.editingLabel = label;
                    this.labelForm.patchValue({
                        name: label.name,
                        color: label.color,
                        description: label.description
                    });
                    this.showAddLabel = true;
                }

    onSaveLabel(): void {
                    if (this.labelForm.valid) {
                        this.loading = true;
                        const formData = this.labelForm.value;

                        if (this.editingLabel) {
                            // Update existing label
                            const updatedLabel: MultiPurposeLabel = {
                                ...this.editingLabel,
                                ...formData,
                                updatedAt: new Date()
                            };

                            // TODO: Implement actual API call
                            setTimeout(() => {
                                const index = this.labels.findIndex(l => l.id === this.editingLabel!.id);
                                if (index !== -1) {
                                    this.labels[index] = updatedLabel;
                                }
                                this.loading = false;
                                this.snackBar.open('Label updated successfully', 'Close', { duration: 3000 });
                                this.showAddLabel = false;
                                this.editingLabel = null;
                            }, 500);
                        } else {
                            // Create new label
                            const newLabel: MultiPurposeLabel = {
                                id: Date.now().toString(),
                                ...formData,
                                usageCount: 0,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            };

                            // TODO: Implement actual API call
                            setTimeout(() => {
                                this.labels.unshift(newLabel);
                                this.loading = false;
                                this.snackBar.open('Label created successfully', 'Close', { duration: 3000 });
                                this.showAddLabel = false;
                            }, 500);
                        }
                    } else {
                        this.markFormGroupTouched();
                    }
                }

    onDeleteLabel(label: MultiPurposeLabel): void {
                    if (confirm(`Are you sure you want to delete the label "${label.name}"?`)) {
                        this.loading = true;

                        // TODO: Implement actual API call
                        setTimeout(() => {
                            this.labels = this.labels.filter(l => l.id !== label.id);
                            this.loading = false;
                            this.snackBar.open('Label deleted successfully', 'Close', { duration: 3000 });
                        }, 500);
                    }
                }

    onBulkDelete(): void {
                    if (this.selectedLabels.length === 0) {
                        this.snackBar.open('Please select labels to delete', 'Close', { duration: 3000 });
                        return;
                    }

                    if (confirm(`Are you sure you want to delete ${this.selectedLabels.length} selected labels?`)) {
                        this.loading = true;

                        // TODO: Implement actual API call
                        setTimeout(() => {
                            this.labels = this.labels.filter(l => !this.selectedLabels.includes(l.id));
                            this.selectedLabels = [];
                            this.loading = false;
                            this.snackBar.open('Labels deleted successfully', 'Close', { duration: 3000 });
                        }, 500);
                    }
                }

    onCancel(): void {
                    this.showAddLabel = false;
                    this.editingLabel = null;
                }

    onSelectAll(): void {
                    if (this.selectedLabels.length === this.labels.length) {
                        this.selectedLabels = [];
                    } else {
                        this.selectedLabels = this.labels.map(l => l.id);
                    }
                }

    onSelectLabel(labelId: string): void {
                    const index = this.selectedLabels.indexOf(labelId);
                    if (index > -1) {
                        this.selectedLabels.splice(index, 1);
                    } else {
                        this.selectedLabels.push(labelId);
                    }
                }

    isSelected(labelId: string): boolean {
                    return this.selectedLabels.includes(labelId);
                }

    getFilteredLabels(): MultiPurposeLabel[] {
                    if (!this.searchTerm) {
                        return this.labels;
                    }
                    return this.labels.filter(label =>
                        label.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                        label.description.toLowerCase().includes(this.searchTerm.toLowerCase())
                    );
                }

    getErrorMessage(fieldName: string): string {
                    const field = this.labelForm.get(fieldName);
                    if (field?.hasError('required')) {
                        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
                    }
                    if (field?.hasError('maxlength')) {
                        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${field?.errors?.['maxlength'].requiredLength} characters`;
                    }
                    if (field?.hasError('pattern')) {
                        return 'Please enter a valid hex color (e.g., #1976d2)';
                    }
                    return '';
                }

    canSave(): boolean {
                    return this.labelForm.valid && !this.loading;
                }

    canDelete(): boolean {
                    return this.selectedLabels.length > 0 && !this.loading;
                }

    getFormattedDate(date: Date): string {
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }

    getDescriptionLength(): number {
                    const description = this.labelForm.get('description')?.value || '';
                    return description.length;
                }

    getMaxDescriptionLength(): number {
                    return 200;
                }
            } 