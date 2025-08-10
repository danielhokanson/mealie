import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecipePrintViewComponent } from '../recipe-print-view/recipe-print-view.component';

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    image?: string;
    prepTime?: string;
    totalTime?: string;
    performTime?: string;
    recipeYield?: string;
    recipeYieldQuantity?: number;
    recipeServings?: number;
    recipeIngredient?: any[];
    recipeInstructions?: any[];
    notes?: any[];
    nutrition?: any;
    settings?: any;
    slug: string;
}

@Component({
    selector: 'app-recipe-print-container',
    standalone: true,
    imports: [
        CommonModule,
        RecipePrintViewComponent
    ],
    templateUrl: './recipe-print-container.component.html',
    styleUrls: ['./recipe-print-container.component.scss']
})
export class RecipePrintContainerComponent {
    @Input() recipe!: Recipe;
    @Input() scale = 1;
} 