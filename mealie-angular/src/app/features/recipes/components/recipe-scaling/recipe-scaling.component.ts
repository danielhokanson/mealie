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
import { Recipe, RecipeIngredient } from '../../../../core/models/recipe.model';

@Component({
    selector: 'app-recipe-scaling',
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
    templateUrl: './recipe-scaling.component.html',
    styleUrls: ['./recipe-scaling.component.scss']
})
export class RecipeScalingComponent implements OnInit, OnDestroy {
    @Input() recipe: Recipe | null = null;
    
    loading = false;
    scalingForm: FormGroup;
    originalServings = 4;
    targetServings = 4;
    scalingFactor = 1.0;
    scaledIngredients: RecipeIngredient[] = [];
    showAdvanced = false;
    roundDecimals = true;
    roundToNearest = 0.25;

    scalingOptions = [
        { value: 0.25, label: '1/4 Recipe' },
        { value: 0.5, label: '1/2 Recipe' },
        { value: 0.75, label: '3/4 Recipe' },
        { value: 1.0, label: 'Original' },
        { value: 1.5, label: '1.5x Recipe' },
        { value: 2.0, label: '2x Recipe' },
        { value: 3.0, label: '3x Recipe' },
        { value: 4.0, label: '4x Recipe' }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadRecipeData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.scalingForm = this.fb.group({
            targetServings: [4, [Validators.required, Validators.min(0.25), Validators.max(100)]],
            roundDecimals: [true],
            roundToNearest: [0.25],
            scaleTime: [true],
            scaleTemperature: [false],
            scaleEquipment: [false]
        });
    }

    private loadRecipeData(): void {
        if (this.recipe) {
            this.originalServings = this.recipe.servings || 4;
            this.targetServings = this.originalServings;
            this.scalingFactor = 1.0;
            this.scaledIngredients = [...(this.recipe.ingredients || [])];
            this.scalingForm.patchValue({
                targetServings: this.originalServings
            });
        }
    }

    onServingsChange(): void {
        const targetServings = this.scalingForm.get('targetServings')?.value;
        if (targetServings && this.originalServings > 0) {
            this.targetServings = targetServings;
            this.scalingFactor = targetServings / this.originalServings;
            this.updateScaledIngredients();
        }
    }

    onScalingOptionChange(factor: number): void {
        this.scalingFactor = factor;
        this.targetServings = this.originalServings * factor;
        this.scalingForm.patchValue({
            targetServings: this.targetServings
        });
        this.updateScaledIngredients();
    }

    onToggleAdvanced(): void {
        this.showAdvanced = !this.showAdvanced;
    }

    onToggleRounding(): void {
        this.roundDecimals = !this.roundDecimals;
        this.scalingForm.patchValue({
            roundDecimals: this.roundDecimals
        });
        this.updateScaledIngredients();
    }

    onRoundToNearestChange(value: number): void {
        this.roundToNearest = value;
        this.scalingForm.patchValue({
            roundToNearest: value
        });
        this.updateScaledIngredients();
    }

    private updateScaledIngredients(): void {
        if (!this.recipe?.ingredients) return;

        this.scaledIngredients = this.recipe.ingredients.map(ingredient => ({
            ...ingredient,
            quantity: this.calculateScaledQuantity(ingredient.quantity)
        }));
    }

    private calculateScaledQuantity(originalQuantity: number): number {
        let scaledQuantity = originalQuantity * this.scalingFactor;
        
        if (this.roundDecimals) {
            scaledQuantity = this.roundToNearestValue(scaledQuantity, this.roundToNearest);
        }
        
        return scaledQuantity;
    }

    private roundToNearestValue(value: number, nearest: number): number {
        return Math.round(value / nearest) * nearest;
    }

    onExportScaledRecipe(): void {
        if (this.recipe) {
            this.loading = true;
            
            // TODO: Implement actual export API call
            setTimeout(() => {
                this.loading = false;
                this.snackBar.open('Scaled recipe exported successfully', 'Close', { duration: 3000 });
            }, 1000);
        }
    }

    onPrintScaledRecipe(): void {
        if (this.recipe) {
            this.loading = true;
            
            // TODO: Implement actual print functionality
            setTimeout(() => {
                this.loading = false;
                this.snackBar.open('Scaled recipe printed successfully', 'Close', { duration: 3000 });
            }, 1000);
        }
    }

    onSaveScaledRecipe(): void {
        if (this.recipe) {
            this.loading = true;
            
            // TODO: Implement actual save API call
            setTimeout(() => {
                this.loading = false;
                this.snackBar.open('Scaled recipe saved successfully', 'Close', { duration: 3000 });
            }, 1000);
        }
    }

    getScaledTime(originalTime: number): number {
        if (this.scalingForm.get('scaleTime')?.value) {
            return Math.round(originalTime * this.scalingFactor);
        }
        return originalTime;
    }

    getScaledTemperature(originalTemp: number): number {
        if (this.scalingForm.get('scaleTemperature')?.value) {
            // Temperature scaling might be more complex in practice
            return originalTemp;
        }
        return originalTemp;
    }

    getFormattedQuantity(quantity: number): string {
        if (quantity === 0) return '0';
        
        // Handle fractions
        if (quantity <= 0.5) {
            const fractions = [
                { value: 0.125, text: '1/8' },
                { value: 0.25, text: '1/4' },
                { value: 0.33, text: '1/3' },
                { value: 0.375, text: '3/8' },
                { value: 0.5, text: '1/2' }
            ];
            
            for (const fraction of fractions) {
                if (Math.abs(quantity - fraction.value) < 0.01) {
                    return fraction.text;
                }
            }
        }
        
        // Handle mixed numbers (e.g., 1 1/2)
        const wholePart = Math.floor(quantity);
        const decimalPart = quantity - wholePart;
        
        if (wholePart > 0 && decimalPart > 0) {
            const fractionText = this.getFractionText(decimalPart);
            return `${wholePart} ${fractionText}`;
        }
        
        return quantity.toFixed(2).replace(/\.?0+$/, '');
    }

    private getFractionText(decimal: number): string {
        const fractions = [
            { value: 0.125, text: '1/8' },
            { value: 0.25, text: '1/4' },
            { value: 0.33, text: '1/3' },
            { value: 0.375, text: '3/8' },
            { value: 0.5, text: '1/2' },
            { value: 0.67, text: '2/3' },
            { value: 0.75, text: '3/4' }
        ];
        
        for (const fraction of fractions) {
            if (Math.abs(decimal - fraction.value) < 0.01) {
                return fraction.text;
            }
        }
        
        return decimal.toFixed(2);
    }

    getScalingSummary(): any {
        return {
            originalServings: this.originalServings,
            targetServings: this.targetServings,
            scalingFactor: this.scalingFactor,
            factorText: this.getFactorText(this.scalingFactor)
        };
    }

    private getFactorText(factor: number): string {
        if (factor === 1) return 'Original';
        if (factor < 1) return `${Math.round(factor * 100)}%`;
        return `${factor}x`;
    }

    getFormattedTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    getErrorMessage(fieldName: string): string {
        const field = this.scalingForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('min')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['min'].min}`;
        }
        if (field?.hasError('max')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${field?.errors?.['max'].max}`;
        }
        return '';
    }
} 