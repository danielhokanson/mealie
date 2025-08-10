import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { RecipeRatingComponent } from '../recipe-rating/recipe-rating.component';
import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';
import { RecipePageInfoCardImageComponent } from '../recipe-page-info-card-image/recipe-page-info-card-image.component';

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    image?: string;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    servings: number;
    rating?: number;
    recipeYieldQuantity?: number;
    recipeYield?: string;
    // ... other recipe properties
}

@Component({
    selector: 'app-recipe-page-info-card',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatDividerModule,
        RecipeRatingComponent,
        SafeMarkdownComponent,
        RecipePageInfoCardImageComponent
    ],
    templateUrl: './recipe-page-info-card.component.html',
    styleUrls: ['./recipe-page-info-card.component.scss']
})
export class RecipePageInfoCardComponent {
    @Input() recipe!: Recipe;
    @Input() recipeScale = 1;
    @Input() landscape = false;
    @Input() isOwnGroup = false;
} 