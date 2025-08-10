import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

export interface RecipeNutrition {
    calories?: number;
    protein?: number;
    fat?: number;
    carbohydrates?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}

@Component({
    selector: 'app-recipe-nutrition',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule
    ],
    templateUrl: './recipe-nutrition.component.html',
    styleUrls: ['./recipe-nutrition.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RecipeNutritionComponent),
            multi: true
        }
    ]
})
export class RecipeNutritionComponent implements ControlValueAccessor {
    @Input() edit = false;

    nutrition: RecipeNutrition = {};

    private onChange = (value: RecipeNutrition) => { };
    private onTouched = () => { };

    // ControlValueAccessor implementation
    writeValue(value: RecipeNutrition): void {
        this.nutrition = value || {};
    }

    registerOnChange(fn: (value: RecipeNutrition) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Implementation for disabled state
    }
} 