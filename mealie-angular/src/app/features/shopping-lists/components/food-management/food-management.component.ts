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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Food } from '../../../../core/models/food.model';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';

@Component({
    selector: 'app-food-management',
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
        MatPaginatorModule,
        MatAutocompleteModule
    ],
    templateUrl: './food-management.component.html',
    styleUrls: ['./food-management.component.scss']
})
export class FoodManagementComponent implements OnInit, OnDestroy {
    loading = false;
    foods: Food[] = [];
    foodForm: FormGroup;
    showAddFood = false;
    editingFood: Food | null = null;
    selectedFoods: string[] = [];
    searchTerm = '';
    filteredFoods: Food[] = [];

    displayedColumns: string[] = ['select', 'name', 'category', 'description', 'usage', 'actions'];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private shoppingListService: ShoppingListService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadFoods();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.foodForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            category: ['', [Validators.required, Validators.maxLength(50)]],
            description: ['', [Validators.maxLength(500)]],
            barcode: ['', [Validators.maxLength(50)]],
            brand: ['', [Validators.maxLength(100)]],
            nutritionInfo: this.fb.group({
                calories: [0, [Validators.min(0)]],
                protein: [0, [Validators.min(0)]],
                carbohydrates: [0, [Validators.min(0)]],
                fat: [0, [Validators.min(0)]],
                fiber: [0, [Validators.min(0)]],
                sugar: [0, [Validators.min(0)]],
                sodium: [0, [Validators.min(0)]]
            })
        });
    }

    private loadFoods(): void {
        this.loading = true;

        this.shoppingListService.getAllFoods()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.foods = response.data || response;
                    this.filteredFoods = [...this.foods];
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading foods:', error);
                    this.snackBar.open('Error loading foods', 'Close', { duration: 3000 });
                    this.loading = false;
                    // Fallback to sample data for development
                    setTimeout(() => {
                        this.foods = [
                            {
                                id: '1',
                                name: 'Chicken Breast',
                                category: 'Meat & Poultry',
                                description: 'Boneless, skinless chicken breast',
                                barcode: '1234567890123',
                                brand: 'Organic Valley',
                                nutritionInfo: {
                                    calories: 165,
                                    protein: 31,
                                    carbohydrates: 0,
                                    fat: 3.6,
                                    fiber: 0,
                                    sugar: 0,
                                    sodium: 74
                                },
                                usageCount: 25,
                                createdAt: new Date('2024-01-01'),
                                updatedAt: new Date('2024-01-15')
                            },
                            {
                                id: '2',
                                name: 'Brown Rice',
                                category: 'Grains & Cereals',
                                description: 'Whole grain brown rice',
                                barcode: '1234567890124',
                                brand: 'Uncle Ben\'s',
                                nutritionInfo: {
                                    calories: 216,
                                    protein: 4.5,
                                    carbohydrates: 45,
                                    fat: 1.8,
                                    fiber: 3.5,
                                    sugar: 0.4,
                                    sodium: 10
                                },
                                usageCount: 18,
                                createdAt: new Date('2024-01-02'),
                                updatedAt: new Date('2024-01-10')
                            },
                            {
                                id: '3',
                                name: 'Broccoli',
                                category: 'Vegetables',
                                description: 'Fresh broccoli florets',
                                barcode: '',
                                brand: '',
                                nutritionInfo: {
                                    calories: 34,
                                    protein: 2.8,
                                    carbohydrates: 7,
                                    fat: 0.4,
                                    fiber: 2.6,
                                    sugar: 1.5,
                                    sodium: 33
                                },
                                usageCount: 32,
                                createdAt: new Date('2024-01-03'),
                                updatedAt: new Date('2024-01-12')
                            },
                            {
                                id: '4',
                                name: 'Olive Oil',
                                category: 'Oils & Fats',
                                description: 'Extra virgin olive oil',
                                barcode: '1234567890125',
                                brand: 'Bertolli',
                                nutritionInfo: {
                                    calories: 884,
                                    protein: 0,
                                    carbohydrates: 0,
                                    fat: 100,
                                    fiber: 0,
                                    sugar: 0,
                                    sodium: 2
                                },
                                usageCount: 15,
                                createdAt: new Date('2024-01-04'),
                                updatedAt: new Date('2024-01-08')
                            },
                            {
                                id: '5',
                                name: 'Banana',
                                category: 'Fruits',
                                description: 'Fresh ripe bananas',
                                barcode: '',
                                brand: '',
                                nutritionInfo: {
                                    calories: 89,
                                    protein: 1.1,
                                    carbohydrates: 23,
                                    fat: 0.3,
                                    fiber: 2.6,
                                    sugar: 12,
                                    sodium: 1
                                },
                                usageCount: 28,
                                createdAt: new Date('2024-01-05'),
                                updatedAt: new Date('2024-01-14')
                            }
                        ];
                        this.filteredFoods = this.foods;
                        this.loading = false;
                    }, 500);
                }
            });
    }

    onAddFood(): void {
        this.editingFood = null;
        this.foodForm.reset();
        this.foodForm.patchValue({
            name: '',
            category: '',
            description: '',
            barcode: '',
            brand: '',
            nutritionInfo: {
                calories: 0,
                protein: 0,
                carbohydrates: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0
            }
        });
        this.showAddFood = true;
    }

    onEditFood(food: Food): void {
        this.editingFood = food;
        this.foodForm.patchValue({
            name: food.name,
            category: food.category,
            description: food.description,
            barcode: food.barcode,
            brand: food.brand,
            nutritionInfo: food.nutritionInfo
        });
        this.showAddFood = true;
    }

    onSaveFood(): void {
        if (this.foodForm.valid) {
            this.loading = true;
            const formData = this.foodForm.value;

            if (this.editingFood) {
                // Update existing food
                this.shoppingListService.updateFood(this.editingFood.id, formData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (updatedFood) => {
                            const index = this.foods.findIndex(f => f.id === this.editingFood!.id);
                            if (index !== -1) {
                                this.foods[index] = updatedFood;
                            }
                            this.loading = false;
                            this.snackBar.open('Food updated successfully', 'Close', { duration: 3000 });
                            this.showAddFood = false;
                            this.editingFood = null;
                        },
                        error: (error) => {
                            console.error('Error updating food:', error);
                            this.snackBar.open('Error updating food', 'Close', { duration: 3000 });
                            this.loading = false;
                        }
                    });
            } else {
                // Create new food
                this.shoppingListService.createFood(formData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (newFood) => {
                            this.foods.unshift(newFood);
                            this.filteredFoods = [...this.foods];
                            this.loading = false;
                            this.snackBar.open('Food created successfully', 'Close', { duration: 3000 });
                            this.showAddFood = false;
                        },
                        error: (error) => {
                            console.error('Error creating food:', error);
                            this.snackBar.open('Error creating food', 'Close', { duration: 3000 });
                            this.loading = false;
                        }
                    });
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    onDeleteFood(food: Food): void {
        if (confirm(`Are you sure you want to delete "${food.name}"?`)) {
            this.loading = true;

            this.shoppingListService.deleteFood(food.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.foods = this.foods.filter(f => f.id !== food.id);
                        this.filteredFoods = [...this.foods];
                        this.loading = false;
                        this.snackBar.open('Food deleted successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error deleting food:', error);
                        this.snackBar.open('Error deleting food', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
        }
    }

    onBulkDelete(): void {
        if (this.selectedFoods.length === 0) {
            this.snackBar.open('Please select foods to delete', 'Close', { duration: 3000 });
            return;
        }

        if (confirm(`Are you sure you want to delete ${this.selectedFoods.length} selected foods?`)) {
            this.loading = true;

            // TODO: Implement actual API call
            setTimeout(() => {
                this.foods = this.foods.filter(f => !this.selectedFoods.includes(f.id));
                this.selectedFoods = [];
                this.loading = false;
                this.snackBar.open('Foods deleted successfully', 'Close', { duration: 3000 });
            }, 500);
        }
    }

    onCancel(): void {
        this.showAddFood = false;
        this.editingFood = null;
    }

    onSelectAll(): void {
        if (this.selectedFoods.length === this.foods.length) {
            this.selectedFoods = [];
        } else {
            this.selectedFoods = this.foods.map(f => f.id);
        }
    }

    onSelectFood(foodId: string): void {
        const index = this.selectedFoods.indexOf(foodId);
        if (index > -1) {
            this.selectedFoods.splice(index, 1);
        } else {
            this.selectedFoods.push(foodId);
        }
    }

    isSelected(foodId: string): boolean {
        return this.selectedFoods.includes(foodId);
    }

    onSearchChange(): void {
        if (!this.searchTerm) {
            this.filteredFoods = this.foods;
        } else {
            this.filteredFoods = this.foods.filter(food =>
                food.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                food.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                food.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                food.brand.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }
    }

    getCategories(): string[] {
        return [...new Set(this.foods.map(food => food.category))].sort();
    }

    getErrorMessage(fieldName: string): string {
        const field = this.foodForm.get(fieldName);
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
        return this.foodForm.valid && !this.loading;
    }

    canDelete(): boolean {
        return this.selectedFoods.length > 0 && !this.loading;
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getDescriptionLength(): number {
        const description = this.foodForm.get('description')?.value || '';
        return description.length;
    }

    getMaxDescriptionLength(): number {
        return 500;
    }

    getNutritionValue(nutritionInfo: any, field: string): number {
        return nutritionInfo?.[field] || 0;
    }

    private markFormGroupTouched(): void {
        Object.keys(this.foodForm.controls).forEach(key => {
            const control = this.foodForm.get(key);
            control?.markAsTouched();
        });
    }
} 