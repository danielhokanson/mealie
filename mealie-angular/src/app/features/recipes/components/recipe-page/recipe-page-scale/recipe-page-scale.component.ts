import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface Recipe {
    id: string;
    name: string;
    servings: number;
    settings?: {
        disableAmount?: boolean;
    };
    // ... other recipe properties
}

@Component({
    selector: 'app-recipe-page-scale',
    standalone: true,
    imports: [
        CommonModule,
        MatSliderModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './recipe-page-scale.component.html',
    styleUrls: ['./recipe-page-scale.component.scss']
})
export class RecipePageScaleComponent {
    @Input() recipe!: Recipe;
    @Input() isEditMode = false;
    @Input() scale = 1;

    @Output() scaleChange = new EventEmitter<number>();

    get canEditScale(): boolean {
        return !this.isEditMode && !this.recipe.settings?.disableAmount;
    }

    get recipeServings(): number {
        return this.recipe.servings || 1;
    }

    onScaleChange(value: number): void {
        this.scale = value;
        this.scaleChange.emit(value);
    }

    resetScale(): void {
        this.onScaleChange(1);
    }

    getScaledServings(): number {
        return Math.round(this.recipeServings * this.scale);
    }

    formatScale(scale: number): string {
        return scale.toFixed(2).replace(/\.?0+$/, '');
    }
} 