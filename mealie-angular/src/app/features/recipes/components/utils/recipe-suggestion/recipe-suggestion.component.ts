import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { RecipeCardMobileComponent } from '../recipe-card-mobile/recipe-card-mobile.component';

export interface RecipeSummary {
    id: string;
    name: string;
    description?: string;
    slug: string;
    rating?: number;
    image?: string;
}

export interface IngredientFood {
    id: string;
    name: string;
    pluralName?: string;
}

export interface RecipeTool {
    id: string;
    name: string;
}

export interface Organizer {
    type: 'food' | 'tool';
    item: IngredientFood | RecipeTool;
    selected: boolean;
}

export interface OrganizerGroup {
    type: 'food' | 'tool';
    show: boolean;
    icon: string;
    items: Organizer[];
    getLabel: (item: IngredientFood | RecipeTool) => string;
}

@Component({
    selector: 'app-recipe-suggestion',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatChipsModule,
        MatCheckboxModule,
        MatIconModule,
        RecipeCardMobileComponent
    ],
    templateUrl: './recipe-suggestion.component.html',
    styleUrls: ['./recipe-suggestion.component.scss']
})
export class RecipeSuggestionComponent {
    @Input() recipe!: RecipeSummary;
    @Input() missingFoods?: IngredientFood[] | null;
    @Input() missingTools?: RecipeTool[] | null;
    @Input() disableCheckbox = false;

    @Output() addFood = new EventEmitter<IngredientFood>();
    @Output() removeFood = new EventEmitter<IngredientFood>();
    @Output() addTool = new EventEmitter<RecipeTool>();
    @Output() removeTool = new EventEmitter<RecipeTool>();

    get missingOrganizers(): OrganizerGroup[] {
        return [
            {
                type: 'food',
                show: !!(this.missingFoods && this.missingFoods.length),
                icon: 'restaurant',
                items: this.missingFoods
                    ? this.missingFoods.map(food => ({
                        type: 'food' as const,
                        item: food,
                        selected: false
                    }))
                    : [],
                getLabel: (item: IngredientFood | RecipeTool) => {
                    const food = item as IngredientFood;
                    return food.pluralName || food.name;
                }
            },
            {
                type: 'tool',
                show: !!(this.missingTools && this.missingTools.length),
                icon: 'build',
                items: this.missingTools
                    ? this.missingTools.map(tool => ({
                        type: 'tool' as const,
                        item: tool,
                        selected: false
                    }))
                    : [],
                getLabel: (item: IngredientFood | RecipeTool) => {
                    const tool = item as RecipeTool;
                    return tool.name;
                }
            }
        ];
    }

    handleCheckbox(organizer: Organizer): void {
        if (this.disableCheckbox) {
            return;
        }

        organizer.selected = !organizer.selected;

        if (organizer.selected) {
            if (organizer.type === 'food') {
                this.addFood.emit(organizer.item as IngredientFood);
            } else {
                this.addTool.emit(organizer.item as RecipeTool);
            }
        } else {
            if (organizer.type === 'food') {
                this.removeFood.emit(organizer.item as IngredientFood);
            } else {
                this.removeTool.emit(organizer.item as RecipeTool);
            }
        }
    }
} 