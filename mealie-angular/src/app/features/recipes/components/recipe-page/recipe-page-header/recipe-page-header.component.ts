import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

import { RecipePageInfoCardComponent } from '../recipe-page-info-card/recipe-page-info-card.component';
import { RecipeActionMenuComponent } from '../recipe-action-menu/recipe-action-menu.component';

export interface Recipe {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    servings: number;
    rating?: number;
    householdId?: string;
    // ... other recipe properties
}

export interface HouseholdSummary {
    id: string;
    name: string;
    slug: string;
    // ... other household properties
}

export enum PageMode {
    VIEW = 'view',
    EDIT = 'edit'
}

@Component({
    selector: 'app-recipe-page-header',
    standalone: true,
    imports: [
        CommonModule,
        MatDividerModule,
        RecipePageInfoCardComponent,
        RecipeActionMenuComponent
    ],
    templateUrl: './recipe-page-header.component.html',
    styleUrls: ['./recipe-page-header.component.scss']
})
export class RecipePageHeaderComponent {
    @Input() recipe!: Recipe;
    @Input() recipeScale = 1;
    @Input() landscape = false;
    @Input() isEditMode = false;
    @Input() isOwnGroup = false;
    @Input() canEditRecipe = false;

    @Output() save = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    @Output() modeChange = new EventEmitter<PageMode>();

    PageMode = PageMode;

    setMode(mode: PageMode): void {
        this.modeChange.emit(mode);
    }

    toggleEditMode(): void {
        const newMode = this.isEditMode ? PageMode.VIEW : PageMode.EDIT;
        this.setMode(newMode);
    }

    onSave(): void {
        this.save.emit();
    }

    onDelete(): void {
        this.delete.emit();
    }

    printRecipe(): void {
        window.print();
    }
} 