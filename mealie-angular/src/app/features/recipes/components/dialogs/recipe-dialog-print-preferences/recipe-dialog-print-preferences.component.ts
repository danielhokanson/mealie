import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { RecipePrintViewComponent } from '../recipe-print-view/recipe-print-view.component';

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
    recipeIngredient?: any[];
    recipeInstructions?: any[];
    notes?: any[];
    nutrition?: any;
    settings?: any;
    slug: string;
}

export enum ImagePosition {
    Left = 'left',
    Right = 'right',
    Hidden = 'hidden'
}

export interface PrintPreferences {
    imagePosition: ImagePosition;
    showDescription: boolean;
    showNotes: boolean;
    showNutrition: boolean;
}

@Component({
    selector: 'app-recipe-dialog-print-preferences',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatDividerModule,
        FormsModule,
        BaseDialogComponent,
        RecipePrintViewComponent
    ],
    templateUrl: './recipe-dialog-print-preferences.component.html',
    styleUrls: ['./recipe-dialog-print-preferences.component.scss']
})
export class RecipeDialogPrintPreferencesComponent {
    @Input() recipe?: Recipe;
    @Input() open = false;

    @Output() openChange = new EventEmitter<boolean>();

    ImagePosition = ImagePosition;

    preferences: PrintPreferences = {
        imagePosition: ImagePosition.Left,
        showDescription: true,
        showNotes: true,
        showNutrition: true
    };

    get imagePositionValue(): string {
        return this.preferences.imagePosition;
    }

    set imagePositionValue(value: string) {
        this.preferences.imagePosition = value as ImagePosition;
    }

    onDialogChange(open: boolean): void {
        this.open = open;
        this.openChange.emit(open);
    }
} 