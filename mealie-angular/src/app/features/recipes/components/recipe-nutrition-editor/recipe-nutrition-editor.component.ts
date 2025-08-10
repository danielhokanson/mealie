import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
import { MatSliderModule } from '@angular/material/slider';
import { Subject, takeUntil } from 'rxjs';
import { Recipe, RecipeNutrition } from '../../../../core/models/recipe.model';

@Component({
    selector: 'app-recipe-nutrition-editor',
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
        MatSliderModule
    ],
    templateUrl: './recipe-nutrition-editor.component.html',
    styleUrls: ['./recipe-nutrition-editor.component.scss']
})
export class RecipeNutritionEditorComponent implements OnInit, OnDestroy {
    @Input() recipe: Recipe | null = null;

    loading = false;
    nutritionForm: FormGroup;
    showAdvanced = false;
    autoCalculate = true;
    calculatedNutrition: RecipeNutrition | null = null;

    nutritionFields = [
        { key: 'calories', label: 'Calories', unit: 'cal', min: 0, max: 5000 },
        { key: 'protein', label: 'Protein', unit: 'g', min: 0, max: 200 },
        { key: 'fat', label: 'Fat', unit: 'g', min: 0, max: 200 },
        { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g', min: 0, max: 500 },
        { key: 'fiber', label: 'Fiber', unit: 'g', min: 0, max: 100 },
        { key: 'sugar', label: 'Sugar', unit: 'g', min: 0, max: 200 },
        { key: 'sodium', label: 'Sodium', unit: 'mg', min: 0, max: 5000 },
        { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', min: 0, max: 1000 },
        { key: 'vitaminA', label: 'Vitamin A', unit: 'IU', min: 0, max: 10000 },
        { key: 'vitaminC', label: 'Vitamin C', unit: 'mg', min: 0, max: 500 },
        { key: 'vitaminD', label: 'Vitamin D', unit: 'IU', min: 0, max: 1000 },
        { key: 'vitaminE', label: 'Vitamin E', unit: 'mg', min: 0, max: 100 },
        { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg', min: 0, max: 500 },
        { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg', min: 0, max: 10 },
        { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg', min: 0, max: 100 },
        { key: 'calcium', label: 'Calcium', unit: 'mg', min: 0, max: 2000 },
        { key: 'iron', label: 'Iron', unit: 'mg', min: 0, max: 100 },
        { key: 'magnesium', label: 'Magnesium', unit: 'mg', min: 0, max: 1000 },
        { key: 'potassium', label: 'Potassium', unit: 'mg', min: 0, max: 5000 },
        { key: 'zinc', label: 'Zinc', unit: 'mg', min: 0, max: 50 }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadNutritionData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        const formGroup: any = {};

        this.nutritionFields.forEach(field => {
            formGroup[field.key] = [null, [Validators.min(field.min), Validators.max(field.max)]];
        });

        this.nutritionForm = this.fb.group(formGroup);
    }

    private loadNutritionData(): void {
        if (this.recipe?.nutrition) {
            this.nutritionForm.patchValue(this.recipe.nutrition);
        }
    }

    onAutoCalculate(): void {
        this.autoCalculate = !this.autoCalculate;
        if (this.autoCalculate) {
            this.calculateNutrition();
        }
    }

    onCalculateNutrition(): void {
        this.calculateNutrition();
    }

    private calculateNutrition(): void {
        if (this.recipe) {
            this.loading = true;

            // TODO: Implement actual nutrition calculation API call
            setTimeout(() => {
                this.calculatedNutrition = {
                    calories: 350,
                    protein: 12.5,
                    fat: 8.2,
                    carbohydrates: 45.3,
                    fiber: 3.8,
                    sugar: 12.1,
                    sodium: 450,
                    cholesterol: 25,
                    vitaminA: 1200,
                    vitaminC: 15,
                    vitaminD: 80,
                    vitaminE: 2.5,
                    vitaminK: 45,
                    vitaminB6: 0.8,
                    vitaminB12: 1.2,
                    calcium: 180,
                    iron: 2.1,
                    magnesium: 45,
                    potassium: 320,
                    zinc: 1.8
                };

                this.nutritionForm.patchValue(this.calculatedNutrition);
                this.loading = false;
                this.snackBar.open('Nutrition calculated successfully', 'Close', { duration: 2000 });
            }, 1000);
        }
    }

    onSaveNutrition(): void {
        if (this.nutritionForm.valid && this.recipe) {
            this.loading = true;
            const nutritionData = this.nutritionForm.value;

            // TODO: Implement actual API call
            setTimeout(() => {
                this.loading = false;
                this.snackBar.open('Nutrition information saved successfully', 'Close', { duration: 3000 });
            }, 500);
        }
    }

    onResetNutrition(): void {
        if (confirm('Are you sure you want to reset all nutrition values?')) {
            this.nutritionForm.reset();
            this.calculatedNutrition = null;
        }
    }

    onToggleAdvanced(): void {
        this.showAdvanced = !this.showAdvanced;
    }

    getFieldValue(fieldKey: string): number {
        return this.nutritionForm.get(fieldKey)?.value || 0;
    }

    onFieldChange(fieldKey: string, value: number): void {
        this.nutritionForm.patchValue({ [fieldKey]: value });
    }

    getFieldError(fieldKey: string): string {
        const field = this.nutritionForm.get(fieldKey);
        if (field?.hasError('min')) {
            return `Value must be at least ${field.errors?.['min'].min}`;
        }
        if (field?.hasError('max')) {
            return `Value must be no more than ${field.errors?.['max'].max}`;
        }
        return '';
    }

    getNutritionSummary(): any {
        const values = this.nutritionForm.value;
        return {
            totalCalories: values.calories || 0,
            totalProtein: values.protein || 0,
            totalFat: values.fat || 0,
            totalCarbs: values.carbohydrates || 0,
            totalFiber: values.fiber || 0,
            totalSugar: values.sugar || 0
        };
    }

    getDailyValuePercentage(value: number, fieldKey: string): number {
        const dailyValues: { [key: string]: number } = {
            protein: 50,
            fat: 65,
            carbohydrates: 300,
            fiber: 25,
            sugar: 50,
            sodium: 2300,
            cholesterol: 300,
            vitaminA: 5000,
            vitaminC: 90,
            vitaminD: 400,
            vitaminE: 15,
            vitaminK: 80,
            vitaminB6: 2,
            vitaminB12: 6,
            calcium: 1300,
            iron: 18,
            magnesium: 420,
            potassium: 3500,
            zinc: 11
        };

        const dailyValue = dailyValues[fieldKey];
        if (!dailyValue) return 0;

        return Math.round((value / dailyValue) * 100);
    }

    getProgressColor(percentage: number): string {
        if (percentage < 50) return '#4caf50';
        if (percentage < 100) return '#ff9800';
        return '#f44336';
    }

    getFormattedValue(value: number, unit: string): string {
        if (!value || value === 0) return '0';
        return `${value.toFixed(1)} ${unit}`;
    }
} 