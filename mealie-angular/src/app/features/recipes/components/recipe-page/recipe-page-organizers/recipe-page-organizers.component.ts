import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { RecipeOrganizerSelectorComponent } from '../recipe-organizer-selector/recipe-organizer-selector.component';
import { RecipeChipsComponent } from '../recipe-chips/recipe-chips.component';
import { RecipeNutritionComponent } from '../recipe-nutrition/recipe-nutrition.component';
import { RecipeAssetsComponent } from '../recipe-assets/recipe-assets.component';

export interface RecipeCategory {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export interface RecipeTag {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export interface RecipeTool {
    id: string;
    name: string;
    slug: string;
    onHand: boolean;
}

export interface RecipeNutrition {
    calories?: number;
    protein?: number;
    fat?: number;
    carbohydrates?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}

export interface RecipeAsset {
    id: string;
    name: string;
    fileName: string;
    extension: string;
    path: string;
}

export interface Recipe {
    id: string;
    name: string;
    slug: string;
    recipeCategory: RecipeCategory[];
    tags: RecipeTag[];
    tools: RecipeTool[];
    nutrition?: RecipeNutrition;
    assets: RecipeAsset[];
    settings?: {
        showNutrition?: boolean;
        showAssets?: boolean;
    };
    // ... other recipe properties
}

@Component({
    selector: 'app-recipe-page-organizers',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatDividerModule,
        MatChipsModule,
        RecipeOrganizerSelectorComponent,
        RecipeChipsComponent,
        RecipeNutritionComponent,
        RecipeAssetsComponent
    ],
    templateUrl: './recipe-page-organizers.component.html',
    styleUrls: ['./recipe-page-organizers.component.scss']
})
export class RecipePageOrganizersComponent {
    @Input() recipe!: Recipe;
    @Input() isEditForm = false;

    @Output() recipeChange = new EventEmitter<Recipe>();
} 