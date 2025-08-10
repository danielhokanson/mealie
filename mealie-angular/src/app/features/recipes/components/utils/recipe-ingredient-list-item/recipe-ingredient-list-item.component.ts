import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';

export interface RecipeIngredient {
    title?: string;
    quantity?: number;
    unit?: any;
    food?: any;
    note?: string;
    originalText?: string;
}

export interface ParsedIngredient {
    quantity?: string;
    unit?: string;
    name?: string;
    note?: string;
}

@Component({
    selector: 'app-recipe-ingredient-list-item',
    standalone: true,
    imports: [
        CommonModule,
        SafeMarkdownComponent
    ],
    templateUrl: './recipe-ingredient-list-item.component.html',
    styleUrls: ['./recipe-ingredient-list-item.component.scss']
})
export class RecipeIngredientListItemComponent {
    @Input() ingredient!: RecipeIngredient;
    @Input() disableAmount = false;
    @Input() scale = 1;

    get parsedIngredient(): ParsedIngredient {
        return this.parseIngredientText(this.ingredient, this.disableAmount, this.scale);
    }

    private parseIngredientText(ingredient: RecipeIngredient, disableAmount: boolean, scale: number): ParsedIngredient {
        const parts: string[] = [];

        // Quantity
        if (!disableAmount && ingredient.quantity) {
            const scaledQuantity = ingredient.quantity * scale;
            parts.push(scaledQuantity.toString());
        }

        // Unit
        if (ingredient.unit?.name) {
            parts.push(ingredient.unit.name);
        }

        // Food name
        if (ingredient.food?.name) {
            parts.push(ingredient.food.name);
        }

        // Note
        if (ingredient.note) {
            parts.push(`(${ingredient.note})`);
        }

        const fullText = parts.join(' ');

        return {
            quantity: !disableAmount && ingredient.quantity ? (ingredient.quantity * scale).toString() : undefined,
            unit: ingredient.unit?.name,
            name: ingredient.food?.name,
            note: ingredient.note
        };
    }
} 