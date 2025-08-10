import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

import { BaseButtonComponent } from '../base-button/base-button.component';
import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';

export interface RecipeIngredient {
    id: string;
    name: string;
    quantity: number;
    unit?: string;
    notes?: string;
}

export interface RecipeInstruction {
    id: string;
    text: string;
    order: number;
}

export interface Recipe {
    id: string;
    name: string;
    slug: string;
    description?: string;
    instructions?: string;
    ingredients: RecipeIngredient[];
    instructionsList: RecipeInstruction[];
    servings: number;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    rating: number;
    image?: string;
    tags: any[];
    notes?: string;
    isPublic: boolean;
    isArchived: boolean;
    groupId: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

@Component({
    selector: 'app-recipe-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        BaseButtonComponent,
        SafeMarkdownComponent
    ],
    templateUrl: './recipe-page.component.html',
    styleUrls: ['./recipe-page.component.scss']
})
export class RecipePageComponent {
    @Input() recipe!: Recipe;
    @Input() isEditMode = false;
    @Input() isCookMode = false;

    @Output() save = new EventEmitter<Recipe>();
    @Output() delete = new EventEmitter<string>();

    scale = 1;
    isEditForm = false;

    get scaledIngredients(): RecipeIngredient[] {
        return this.recipe.ingredients.map(ingredient => ({
            ...ingredient,
            quantity: ingredient.quantity * this.scale
        }));
    }

    get totalTime(): number {
        return this.recipe.prepTime + this.recipe.cookTime;
    }

    onSave(): void {
        this.save.emit(this.recipe);
    }

    onDelete(): void {
        this.delete.emit(this.recipe.slug);
    }

    onScaleChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.scale = parseFloat(target.value);
    }

    toggleEditMode(): void {
        this.isEditForm = !this.isEditForm;
    }

    addIngredient(): void {
        const newIngredient: RecipeIngredient = {
            id: Date.now().toString(),
            name: '',
            quantity: 1,
            unit: '',
            notes: ''
        };
        this.recipe.ingredients.push(newIngredient);
    }

    removeIngredient(index: number): void {
        this.recipe.ingredients.splice(index, 1);
    }

    addInstruction(): void {
        const newInstruction: RecipeInstruction = {
            id: Date.now().toString(),
            text: '',
            order: this.recipe.instructionsList.length + 1
        };
        this.recipe.instructionsList.push(newInstruction);
    }

    removeInstruction(index: number): void {
        this.recipe.instructionsList.splice(index, 1);
        // Reorder instructions
        this.recipe.instructionsList.forEach((instruction, i) => {
            instruction.order = i + 1;
        });
    }

    trackByIngredientId(index: number, ingredient: RecipeIngredient): string {
        return ingredient.id;
    }

    trackByInstructionId(index: number, instruction: RecipeInstruction): string {
        return instruction.id;
    }
} 