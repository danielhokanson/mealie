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
import { Unit } from '../../../../core/models/unit.model';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';

@Component({
    selector: 'app-unit-management',
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
    templateUrl: './unit-management.component.html',
    styleUrls: ['./unit-management.component.scss']
})
export class UnitManagementComponent implements OnInit, OnDestroy {
    loading = false;
    units: Unit[] = [];
    unitForm: FormGroup;
    showAddUnit = false;
    editingUnit: Unit | null = null;
    selectedUnits: string[] = [];
    searchTerm = '';

    displayedColumns: string[] = ['select', 'name', 'abbreviation', 'description', 'usage', 'actions'];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private shoppingListService: ShoppingListService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadUnits();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.unitForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(50)]],
            abbreviation: ['', [Validators.required, Validators.maxLength(10)]],
            description: ['', [Validators.maxLength(200)]],
            isBaseUnit: [false],
            conversionFactor: [1, [Validators.required, Validators.min(0.001)]],
            baseUnitId: ['']
        });
    }

    private loadUnits(): void {
        this.loading = true;

        this.shoppingListService.getAllUnits()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.units = response.data || response;
                    this.filteredUnits = [...this.units];
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading units:', error);
                    this.snackBar.open('Error loading units', 'Close', { duration: 3000 });
                    this.loading = false;
                    // Initialize with empty array for production
                    this.units = [];
                    this.filteredUnits = [];
                }
            });
    }

    onAddUnit(): void {
        this.editingUnit = null;
        this.unitForm.reset();
        this.unitForm.patchValue({
            name: '',
            abbreviation: '',
            description: '',
            isBaseUnit: false,
            conversionFactor: 1,
            baseUnitId: ''
        });
        this.showAddUnit = true;
    }

    onEditUnit(unit: Unit): void {
        this.editingUnit = unit;
        this.unitForm.patchValue({
            name: unit.name,
            abbreviation: unit.abbreviation,
            description: unit.description,
            isBaseUnit: unit.isBaseUnit,
            conversionFactor: unit.conversionFactor,
            baseUnitId: unit.baseUnitId || ''
        });
        this.showAddUnit = true;
    }

    onSaveUnit(): void {
        if (this.unitForm.valid) {
            this.loading = true;
            const formData = this.unitForm.value;

            if (this.editingUnit) {
                // Update existing unit
                this.shoppingListService.updateUnit(this.editingUnit.id, formData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (updatedUnit) => {
                            const index = this.units.findIndex(u => u.id === this.editingUnit!.id);
                            if (index !== -1) {
                                this.units[index] = updatedUnit;
                                this.filteredUnits = [...this.units];
                            }
                            this.loading = false;
                            this.snackBar.open('Unit updated successfully', 'Close', { duration: 3000 });
                            this.showAddUnit = false;
                            this.editingUnit = null;
                        },
                        error: (error) => {
                            console.error('Error updating unit:', error);
                            this.snackBar.open('Error updating unit', 'Close', { duration: 3000 });
                            this.loading = false;
                        }
                    });
            } else {
                // Create new unit
                this.shoppingListService.createUnit(formData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (newUnit) => {
                            this.units.unshift(newUnit);
                            this.filteredUnits = [...this.units];
                            this.loading = false;
                            this.snackBar.open('Unit created successfully', 'Close', { duration: 3000 });
                            this.showAddUnit = false;
                        },
                        error: (error) => {
                            console.error('Error creating unit:', error);
                            this.snackBar.open('Error creating unit', 'Close', { duration: 3000 });
                            this.loading = false;
                        }
                    });
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    onDeleteUnit(unit: Unit): void {
        if (confirm(`Are you sure you want to delete the unit "${unit.name}"?`)) {
            this.loading = true;

            this.shoppingListService.deleteUnit(unit.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.units = this.units.filter(u => u.id !== unit.id);
                        this.filteredUnits = [...this.units];
                        this.loading = false;
                        this.snackBar.open('Unit deleted successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error deleting unit:', error);
                        this.snackBar.open('Error deleting unit', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
        }
    }

    onBulkDelete(): void {
        if (this.selectedUnits.length === 0) {
            this.snackBar.open('Please select units to delete', 'Close', { duration: 3000 });
            return;
        }

        if (confirm(`Are you sure you want to delete ${this.selectedUnits.length} selected units?`)) {
            this.loading = true;

            // TODO: Implement actual API call
            setTimeout(() => {
                this.units = this.units.filter(u => !this.selectedUnits.includes(u.id));
                this.selectedUnits = [];
                this.loading = false;
                this.snackBar.open('Units deleted successfully', 'Close', { duration: 3000 });
            }, 500);
        }
    }

    onCancel(): void {
        this.showAddUnit = false;
        this.editingUnit = null;
    }

    onSelectAll(): void {
        if (this.selectedUnits.length === this.units.length) {
            this.selectedUnits = [];
        } else {
            this.selectedUnits = this.units.map(u => u.id);
        }
    }

    onSelectUnit(unitId: string): void {
        const index = this.selectedUnits.indexOf(unitId);
        if (index > -1) {
            this.selectedUnits.splice(index, 1);
        } else {
            this.selectedUnits.push(unitId);
        }
    }

    isSelected(unitId: string): boolean {
        return this.selectedUnits.includes(unitId);
    }

    getFilteredUnits(): Unit[] {
        if (!this.searchTerm) {
            return this.units;
        }
        return this.units.filter(unit =>
            unit.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            unit.abbreviation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            unit.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    getBaseUnits(): Unit[] {
        return this.units.filter(unit => unit.isBaseUnit);
    }

    getBaseUnitName(baseUnitId: string | null): string {
        if (!baseUnitId) return 'N/A';
        const baseUnit = this.units.find(u => u.id === baseUnitId);
        return baseUnit ? baseUnit.name : 'Unknown';
    }

    getErrorMessage(fieldName: string): string {
        const field = this.unitForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('maxlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${field?.errors?.['maxlength'].requiredLength} characters`;
        }
        if (field?.hasError('min')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['min'].min}`;
        }
        return '';
    }

    canSave(): boolean {
        return this.unitForm.valid && !this.loading;
    }

    canDelete(): boolean {
        return this.selectedUnits.length > 0 && !this.loading;
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getDescriptionLength(): number {
        const description = this.unitForm.get('description')?.value || '';
        return description.length;
    }

    getMaxDescriptionLength(): number {
        return 200;
    }

    onBaseUnitChange(): void {
        const isBaseUnit = this.unitForm.get('isBaseUnit')?.value;
        const conversionFactor = this.unitForm.get('conversionFactor');
        const baseUnitId = this.unitForm.get('baseUnitId');

        if (isBaseUnit) {
            conversionFactor?.setValue(1);
            baseUnitId?.setValue('');
            baseUnitId?.disable();
        } else {
            baseUnitId?.enable();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.unitForm.controls).forEach(key => {
            const control = this.unitForm.get(key);
            control?.markAsTouched();
        });
    }
} 