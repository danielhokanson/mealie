import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { RecipeCardComponent } from '../recipe-card/recipe-card.component';

export interface RecipeSummary {
    id: string;
    name: string;
    slug: string;
    description?: string;
    rating?: number;
    image?: string;
    tags?: any[];
    groupId?: string;
    userId?: string;
}

export interface ShoppingListItemOut {
    id: string;
    name: string;
    quantity: number;
    unit?: {
        name: string;
        abbreviation?: string;
        useAbbreviation?: boolean;
        fraction?: boolean;
    };
    recipeReferences?: Array<{
        recipeId: string;
        recipeQuantity?: number;
        recipeScale?: number;
        recipeNote?: string;
    }>;
}

@Component({
    selector: 'app-recipe-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatListModule,
        MatCardModule,
        MatIconModule,
        RecipeCardComponent
    ],
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent {
    @Input() recipes: RecipeSummary[] = [];
    @Input() listItem?: ShoppingListItemOut;
    @Input() small = false;
    @Input() tile = false;
    @Input() showDescription = false;
    @Input() disabled = false;
    @Input() isOwnGroup = false;

    @Output() recipeClick = new EventEmitter<RecipeSummary>();
    @Output() recipeDelete = new EventEmitter<string>();

    get listItemDescriptions(): string[] {
        if (
            this.recipes.length === 1 ||
            !this.listItem?.recipeReferences ||
            this.listItem.recipeReferences.length !== this.recipes.length
        ) {
            return this.recipes.map(() => '');
        }

        const descriptions: string[] = [];
        for (let i = 0; i < this.recipes.length; i++) {
            const itemRef = this.listItem?.recipeReferences[i];
            const quantity = (itemRef?.recipeQuantity || 1) * (itemRef?.recipeScale || 1);

            let description = '';
            if (this.listItem?.unit?.fraction) {
                // Simplified fraction logic - in a real app, you'd use a proper fraction library
                const whole = Math.floor(quantity);
                const fraction = quantity - whole;

                if (whole > 0) {
                    description += whole.toString();
                }

                if (fraction > 0) {
                    // Simplified fraction display
                    description += ` ${Math.round(fraction * 100)}/100`;
                } else {
                    description = quantity.toString();
                }
            } else {
                description = (Math.round(quantity * 100) / 100).toString();
            }

            if (this.listItem?.unit) {
                const unitDisplay = this.listItem.unit.useAbbreviation && this.listItem.unit.abbreviation
                    ? this.listItem.unit.abbreviation
                    : this.listItem.unit.name;
                description += ` ${unitDisplay}`;
            }

            if (itemRef?.recipeNote) {
                description += `, ${itemRef.recipeNote}`;
            }

            descriptions.push(this.sanitizeHTML(description));
        }

        return descriptions;
    }

    onRecipeClick(recipe: RecipeSummary): void {
        this.recipeClick.emit(recipe);
    }

    onRecipeDelete(slug: string): void {
        this.recipeDelete.emit(slug);
    }

    trackByRecipeId(index: number, recipe: RecipeSummary): string {
        return recipe.id;
    }

    private sanitizeHTML(rawHtml: string): string {
        // Basic HTML sanitization
        return rawHtml
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
} 