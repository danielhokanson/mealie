import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

export interface Recipe {
    id: string;
    name: string;
    orgURL?: string;
    extras?: { [key: string]: string };
    // ... other recipe properties
}

@Component({
    selector: 'app-recipe-page-footer',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatDividerModule
    ],
    templateUrl: './recipe-page-footer.component.html',
    styleUrls: ['./recipe-page-footer.component.scss']
})
export class RecipePageFooterComponent {
    @Input() recipe!: Recipe;
    @Input() isEditForm = false;
    @Input() isCookMode = false;
    @Input() isAdvancedUser = false;

    @Output() recipeChange = new EventEmitter<Recipe>();

    apiNewKey = '';

    get extrasArray(): { key: string; value: string }[] {
        if (!this.recipe.extras) return [];
        return Object.entries(this.recipe.extras).map(([key, value]) => ({ key, value }));
    }

    createApiExtra(): void {
        if (!this.apiNewKey || this.hasDuplicateKey()) {
            return;
        }

        if (!this.recipe.extras) {
            this.recipe.extras = {};
        }

        this.recipe.extras[this.apiNewKey] = '';
        this.apiNewKey = '';
        this.recipeChange.emit(this.recipe);
    }

    removeApiExtra(key: string): void {
        if (!this.recipe.extras) {
            return;
        }

        delete this.recipe.extras[key];
        this.recipe.extras = { ...this.recipe.extras };
        this.recipeChange.emit(this.recipe);
    }

    hasDuplicateKey(): boolean {
        if (!this.recipe.extras) return false;
        return Object.keys(this.recipe.extras).includes(this.apiNewKey);
    }
} 