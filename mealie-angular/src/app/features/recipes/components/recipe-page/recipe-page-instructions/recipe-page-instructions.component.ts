import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';

import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';
import { RecipeIngredientHtmlComponent } from '../recipe-ingredient-html/recipe-ingredient-html.component';
import { RecipeIngredientsComponent } from '../recipe-ingredients/recipe-ingredients.component';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

export interface RecipeStep {
    id: string;
    title?: string;
    summary?: string;
    text: string;
    position: number;
    ingredientReferences?: IngredientReference[];
}

export interface IngredientReference {
    referenceId: string;
    stepId: string;
}

export interface RecipeIngredient {
    id: string;
    title?: string;
    note?: string;
    unit?: string;
    food?: string;
    disableAmount?: boolean;
    quantity: number;
    referenceId?: string;
}

export interface Recipe {
    id: string;
    name: string;
    recipeIngredient: RecipeIngredient[];
    settings?: {
        disableAmount?: boolean;
    };
    // ... other recipe properties
}

export interface RecipeAsset {
    id: string;
    name: string;
    fileName: string;
    extension: string;
    path: string;
}

@Component({
    selector: 'app-recipe-page-instructions',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatCheckboxModule,
        MatDividerModule,
        MatProgressBarModule,
        MatDialogModule,
        MatTooltipModule,
        MatMenuModule,
        CdkDropList,
        CdkDrag,
        SafeMarkdownComponent,
        RecipeIngredientHtmlComponent,
        RecipeIngredientsComponent,
        MarkdownEditorComponent
    ],
    templateUrl: './recipe-page-instructions.component.html',
    styleUrls: ['./recipe-page-instructions.component.scss']
})
export class RecipePageInstructionsComponent implements OnInit {
    @Input() recipe!: Recipe;
    @Input() scale = 1;
    @Input() isEditForm = false;
    @Input() isCookMode = false;

    @Output() clickInstructionField = new EventEmitter<string>();
    @Output() assetsChange = new EventEmitter<RecipeAsset[]>();

    instructionList: RecipeStep[] = [];
    assets: RecipeAsset[] = [];

    showLinkDialog = false;
    disabledSteps: number[] = [];
    unusedIngredients: RecipeIngredient[] = [];
    usedIngredients: RecipeIngredient[] = [];
    activeRefs: string[] = [];
    activeText = '';
    activeStepIndex = -1;

    showTitleEditor: { [key: string]: boolean } = {};
    previewStates: { [key: number]: boolean } = {};
    loadingStates: { [key: number]: boolean } = {};

    constructor() { }

    ngOnInit(): void {
        this.initializeInstructions();
    }

    private initializeInstructions(): void {
        // Initialize instruction list from recipe
        if (this.recipe) {
            // In a real app, you'd load instructions from the backend
            // this.instructionList = await this.recipeService.getRecipeInstructions(this.recipe.id);
        }
    }

    toggleCookMode(): void {
        this.isCookMode = !this.isCookMode;
    }

    toggleDisabled(index: number): void {
        if (this.disabledSteps.includes(index)) {
            this.disabledSteps = this.disabledSteps.filter(i => i !== index);
        } else {
            this.disabledSteps.push(index);
        }
    }

    isChecked(index: number): boolean {
        return !this.disabledSteps.includes(index);
    }

    openLinkDialog(index: number, text: string, references?: IngredientReference[]): void {
        this.activeStepIndex = index;
        this.activeText = text;
        this.activeRefs = references?.map(r => r.referenceId) || [];
        this.showLinkDialog = true;

        // Populate unused and used ingredients
        this.populateIngredientLists();
    }

    closeLinkDialog(): void {
        this.showLinkDialog = false;
        this.activeStepIndex = -1;
        this.activeText = '';
        this.activeRefs = [];
    }

    private populateIngredientLists(): void {
        // In a real app, you'd get this from the backend
        this.unusedIngredients = this.recipe.recipeIngredient.filter(ing =>
            !this.instructionList.some(step =>
                step.ingredientReferences?.some(ref => ref.referenceId === ing.referenceId)
            )
        );

        this.usedIngredients = this.recipe.recipeIngredient.filter(ing =>
            this.instructionList.some(step =>
                step.ingredientReferences?.some(ref => ref.referenceId === ing.referenceId)
            )
        );
    }

    autoSetReferences(): void {
        // Auto-detect ingredient references in text
        // Implementation would analyze text and match ingredients
    }

    setIngredientIds(): void {
        if (this.activeStepIndex >= 0) {
            const step = this.instructionList[this.activeStepIndex];
            step.ingredientReferences = this.activeRefs.map(refId => ({
                referenceId: refId,
                stepId: step.id
            }));
        }
        this.closeLinkDialog();
    }

    saveAndOpenNextLinkIngredients(): void {
        this.setIngredientIds();
        // Open next step dialog
    }

    get availableNextStep(): boolean {
        return this.activeStepIndex < this.instructionList.length - 1;
    }

    parseIngredientText(ingredient: RecipeIngredient): string {
        // Parse ingredient to HTML markup
        let text = '';
        if (ingredient.quantity && !ingredient.disableAmount) {
            text += ingredient.quantity + ' ';
        }
        if (ingredient.unit) {
            text += ingredient.unit + ' ';
        }
        if (ingredient.food) {
            text += ingredient.food;
        }
        if (ingredient.note) {
            text += ' (' + ingredient.note + ')';
        }
        return text;
    }

    getIngredientByRefId(refId: string): string {
        const ingredient = this.recipe.recipeIngredient.find(ing => ing.referenceId === refId);
        return ingredient ? this.parseIngredientText(ingredient) : '';
    }

    getStepIngredients(step: RecipeStep): RecipeIngredient[] {
        if (!step.ingredientReferences) return [];

        return this.recipe.recipeIngredient.filter(ing =>
            step.ingredientReferences!.some(ref => ref.referenceId === ing.referenceId)
        );
    }

    // Drag and drop
    onDrop(event: CdkDragDrop<RecipeStep[]>): void {
        moveItemInArray(this.instructionList, event.previousIndex, event.currentIndex);
        this.updatePositions();
    }

    private updatePositions(): void {
        this.instructionList.forEach((step, index) => {
            step.position = index;
        });
    }

    // Step management
    deleteStep(index: number): void {
        this.instructionList.splice(index, 1);
        this.updatePositions();
    }

    toggleSection(stepId: string): void {
        this.showTitleEditor[stepId] = !this.showTitleEditor[stepId];
    }

    uploadImage(index: number): void {
        // Implementation for image upload
    }

    togglePreview(index: number): void {
        this.previewStates[index] = !this.previewStates[index];
    }

    mergeAbove(index: number): void {
        if (index > 0) {
            const currentStep = this.instructionList[index];
            const previousStep = this.instructionList[index - 1];
            previousStep.text += '\n\n' + currentStep.text;
            this.deleteStep(index);
        }
    }

    moveToTop(index: number): void {
        const step = this.instructionList.splice(index, 1)[0];
        this.instructionList.unshift(step);
        this.updatePositions();
    }

    moveToBottom(index: number): void {
        const step = this.instructionList.splice(index, 1)[0];
        this.instructionList.push(step);
        this.updatePositions();
    }

    insertAbove(index: number): void {
        const newStep: RecipeStep = {
            id: this.generateId(),
            text: '',
            position: index
        };
        this.instructionList.splice(index, 0, newStep);
        this.updatePositions();
    }

    insertBelow(index: number): void {
        this.insertAbove(index + 1);
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
} 