import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';

import { RecipeListComponent, RecipeSummary } from '../recipe-list/recipe-list.component';
import { MultiPurposeLabelComponent } from '../multi-purpose-label/multi-purpose-label.component';

export interface ShoppingListItem {
    id: string;
    name: string;
    quantity: number;
    unit?: {
        id: string;
        name: string;
        abbreviation?: string;
        useAbbreviation?: boolean;
    };
    food?: {
        id: string;
        name: string;
        label?: {
            id: string;
            name: string;
            color?: string;
        };
    };
    label?: {
        id: string;
        name: string;
        color?: string;
    };
    labels?: MultiPurposeLabel[];
    checked: boolean;
    notes?: string;
    recipeReferences?: Array<{
        recipeId: string;
        recipeQuantity?: number;
        recipeScale?: number;
        recipeNote?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export interface MultiPurposeLabel {
    id: string;
    name: string;
    color?: string;
}

export interface IngredientUnit {
    id: string;
    name: string;
    abbreviation?: string;
    useAbbreviation?: boolean;
}

export interface IngredientFood {
    id: string;
    name: string;
    label?: {
        id: string;
        name: string;
        color?: string;
    };
}

interface ContextAction {
    text: string;
    event: string;
}

@Component({
    selector: 'app-shopping-list-item',
    standalone: true,
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatListModule,
        RecipeListComponent,
        MultiPurposeLabelComponent
    ],
    templateUrl: './shopping-list-item.component.html',
    styleUrls: ['./shopping-list-item.component.scss']
})
export class ShoppingListItemComponent {
    @Input() modelValue!: ShoppingListItem;
    @Input() showLabel = false;
    @Input() labels: MultiPurposeLabel[] = [];
    @Input() units: IngredientUnit[] = [];
    @Input() foods: IngredientFood[] = [];
    @Input() recipes = new Map<string, RecipeSummary>();

    @Output() checked = new EventEmitter<ShoppingListItem>();
    @Output() modelValueChange = new EventEmitter<ShoppingListItem>();
    @Output() save = new EventEmitter<ShoppingListItem>();
    @Output() delete = new EventEmitter<void>();

    edit = false;
    displayRecipeRefs = false;
    localListItem: ShoppingListItem;

    contextMenu: ContextAction[] = [
        { text: 'Edit', event: 'edit' },
        { text: 'Delete', event: 'delete' }
    ];

    constructor() {
        this.localListItem = {} as ShoppingListItem;
    }

    get itemLabelCols(): string {
        return this.modelValue.checked ? 'auto' : this.showLabel ? '4' : '6';
    }

    get label(): MultiPurposeLabel | undefined {
        if (this.modelValue.label) {
            return this.modelValue.label;
        }
        if (this.modelValue.food?.label) {
            return this.modelValue.food.label;
        }
        return undefined;
    }

    get recipeList(): RecipeSummary[] {
        const recipeList: RecipeSummary[] = [];
        if (!this.modelValue.recipeReferences) {
            return recipeList;
        }

        this.modelValue.recipeReferences.forEach((ref) => {
            const recipe = this.recipes.get(ref.recipeId);
            if (recipe) {
                recipeList.push(recipe);
            }
        });

        return recipeList;
    }

    onCheckedChange(checked: boolean): void {
        this.modelValue.checked = checked;
        this.checked.emit(this.modelValue);
    }

    toggleEdit(val = !this.edit): void {
        if (this.edit === val) {
            return;
        }

        if (val) {
            this.localListItem = { ...this.modelValue };
        }

        this.edit = val;
    }

    onContextHandler(event: string): void {
        if (event === 'edit') {
            this.toggleEdit(true);
        } else {
            this.delete.emit();
        }
    }

    onSave(): void {
        this.save.emit(this.localListItem);
        this.edit = false;
    }

    onCancel(): void {
        this.toggleEdit(false);
    }

    getQuantityDisplay(): string {
        const quantity = this.modelValue.quantity;
        const unit = this.modelValue.unit;

        if (quantity === 1 && !unit) {
            return '';
        }

        let display = quantity.toString();
        if (unit) {
            const unitDisplay = unit.useAbbreviation && unit.abbreviation
                ? unit.abbreviation
                : unit.name;
            display += ` ${unitDisplay}`;
        }

        return display;
    }
} 