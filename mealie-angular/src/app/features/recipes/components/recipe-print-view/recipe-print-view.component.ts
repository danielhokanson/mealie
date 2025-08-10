import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { RecipeTimeCardComponent } from '../recipe-time-card/recipe-time-card.component';
import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';

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
    recipeIngredient?: RecipeIngredient[];
    recipeInstructions?: RecipeStep[];
    notes?: RecipeNote[];
    nutrition?: NutritionInfo;
    settings?: RecipeSettings;
    slug: string;
}

export interface RecipeIngredient {
    title?: string;
    note?: string;
    unit?: string;
    food?: string;
    disableAmount?: boolean;
    amount?: number;
}

export interface RecipeStep {
    title?: string;
    text: string;
    summary?: string;
}

export interface RecipeNote {
    title: string;
    text: string;
}

export interface NutritionInfo {
    [key: string]: number | string;
}

export interface RecipeSettings {
    disableAmount?: boolean;
}

export interface IngredientSection {
    sectionName: string;
    ingredients: RecipeIngredient[];
}

export interface InstructionSection {
    sectionName: string;
    stepOffset: number;
    instructions: RecipeStep[];
}

export interface PrintPreferences {
    imagePosition: ImagePosition;
    showDescription: boolean;
    showNotes: boolean;
    showNutrition: boolean;
}

export enum ImagePosition {
    Left = 'left',
    Right = 'right',
    Hidden = 'hidden'
}

export interface NutritionLabel {
    label: string;
    suffix?: string;
}

@Component({
    selector: 'app-recipe-print-view',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule,
        RecipeTimeCardComponent,
        SafeMarkdownComponent
    ],
    templateUrl: './recipe-print-view.component.html',
    styleUrls: ['./recipe-print-view.component.scss']
})
export class RecipePrintViewComponent {
    @Input() recipe!: Recipe;
    @Input() scale = 1;
    @Input() dense = false;
    @Input() preferences?: PrintPreferences;

    get defaultPreferences(): PrintPreferences {
        return {
            imagePosition: ImagePosition.Left,
            showDescription: true,
            showNotes: true,
            showNutrition: true
        };
    }

    nutritionLabels: { [key: string]: NutritionLabel } = {
        calories: { label: 'Calories', suffix: 'kcal' },
        fat: { label: 'Fat', suffix: 'g' },
        saturatedFat: { label: 'Saturated Fat', suffix: 'g' },
        cholesterol: { label: 'Cholesterol', suffix: 'mg' },
        sodium: { label: 'Sodium', suffix: 'mg' },
        carbohydrates: { label: 'Carbohydrates', suffix: 'g' },
        fiber: { label: 'Fiber', suffix: 'g' },
        sugar: { label: 'Sugar', suffix: 'g' },
        protein: { label: 'Protein', suffix: 'g' }
    };

    get recipeImageUrl(): string {
        if (!this.recipe.image) return '';
        return `/api/media/recipes/${this.recipe.id}/images/${this.recipe.image}`;
    }

    get servingsDisplay(): string {
        const scaledAmount = this.recipe.recipeYieldQuantity ? this.recipe.recipeYieldQuantity * this.scale : 0;
        const amountText = scaledAmount > 0 ? scaledAmount.toString() : '';
        const yieldText = this.recipe.recipeYield || '';

        if (amountText && yieldText) {
            return `Yields ${amountText} ${yieldText}`;
        } else if (amountText) {
            return `Yields ${amountText}`;
        } else if (yieldText) {
            return yieldText;
        }
        return '';
    }

    get yieldDisplay(): string {
        const scaledAmount = this.recipe.recipeServings ? this.recipe.recipeServings * this.scale : 0;
        return scaledAmount > 0 ? `Serves ${scaledAmount}` : '';
    }

    get recipeYield(): string {
        if (this.servingsDisplay && this.yieldDisplay) {
            return `${this.yieldDisplay}; ${this.servingsDisplay}`;
        } else {
            return this.yieldDisplay || this.servingsDisplay;
        }
    }

    get ingredientSections(): IngredientSection[] {
        if (!this.recipe.recipeIngredient) {
            return [];
        }

        return this.recipe.recipeIngredient.reduce((sections, ingredient) => {
            if (ingredient.title) {
                sections.push({
                    sectionName: ingredient.title,
                    ingredients: [ingredient]
                });
                return sections;
            }

            if (sections.length === 0) {
                sections.push({
                    sectionName: '',
                    ingredients: [ingredient]
                });
                return sections;
            }

            sections[sections.length - 1].ingredients.push(ingredient);
            return sections;
        }, [] as IngredientSection[]);
    }

    get instructionSections(): InstructionSection[] {
        if (!this.recipe.recipeInstructions) {
            return [];
        }

        return this.recipe.recipeInstructions.reduce((sections, step) => {
            const offset = (() => {
                if (sections.length === 0) {
                    return 0;
                }
                const lastOffset = sections[sections.length - 1].stepOffset;
                const lastNumSteps = sections[sections.length - 1].instructions.length;
                return lastOffset + lastNumSteps;
            })();

            if (step.title) {
                sections.push({
                    sectionName: step.title,
                    stepOffset: offset,
                    instructions: [step]
                });
                return sections;
            }

            if (sections.length === 0) {
                sections.push({
                    sectionName: '',
                    stepOffset: offset,
                    instructions: [step]
                });
                return sections;
            }

            sections[sections.length - 1].instructions.push(step);
            return sections;
        }, [] as InstructionSection[]);
    }

    get hasNotes(): boolean {
        return !!(this.recipe.notes && this.recipe.notes.length > 0);
    }

    parseIngredientText(ingredient: RecipeIngredient): string {
        const parts: string[] = [];

        if (ingredient.amount && !this.recipe.settings?.disableAmount) {
            const scaledAmount = ingredient.amount * this.scale;
            parts.push(scaledAmount.toString());
        }

        if (ingredient.unit) {
            parts.push(ingredient.unit);
        }

        if (ingredient.food) {
            parts.push(ingredient.food);
        }

        if (ingredient.note) {
            parts.push(`(${ingredient.note})`);
        }

        return parts.join(' ');
    }

    getNutritionValue(key: string, value: any): string {
        if (!value) return '-';
        const label = this.nutritionLabels[key];
        if (!label) return value.toString();
        return label.suffix ? `${value} ${label.suffix}` : value.toString();
    }

    getNutritionLabel(key: string): string {
        const label = this.nutritionLabels[key];
        return label ? label.label : key;
    }

    getNumber(value: any): number {
        return Number(value) || 0;
    }
} 