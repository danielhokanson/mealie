import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../../../../core/models/recipe.model';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';
import { ShoppingList } from '../../../../core/models/shopping-list.model';

export interface AddToShoppingListData {
    recipe: Recipe;
}

@Component({
    selector: 'app-recipe-dialog-add-to-shopping-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatListModule,
        MatIconModule
    ],
    template: `
        <div class="dialog-container">
            <h2 mat-dialog-title>Add Recipe to Shopping List</h2>
            
            <div mat-dialog-content>
                <p><strong>{{ recipeNames }}</strong></p>
                
                <form [formGroup]="form" class="form-container">
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Shopping List</mat-label>
                        <mat-select formControlName="shoppingListId" required>
                            <mat-option *ngFor="let list of availableShoppingLists" [value]="list.id">
                                {{ list.name }}
                            </mat-option>
                        </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Notes</mat-label>
                        <textarea matInput formControlName="notes" rows="3" placeholder="Optional notes..."></textarea>
                    </mat-form-field>

                    <div class="ingredients-section">
                        <h3>Ingredients to Add</h3>
                        <div class="ingredients-list">
                            <div *ngFor="let ingredient of allIngredients" class="ingredient-item">
                                <mat-checkbox 
                                    [checked]="isIngredientSelected(ingredient)" 
                                    (change)="onIngredientToggle(ingredient, $event.checked)">
                                    {{ ingredient.note || ingredient.food || 'Unknown ingredient' }}
                                    <span *ngIf="ingredient.quantity">({{ ingredient.quantity }})</span>
                                </mat-checkbox>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div mat-dialog-actions>
                <button mat-button (click)="onCancel()">Cancel</button>
                <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="onAdd()"
                    [disabled]="!form.valid || selectedIngredients.length === 0">
                    Add to List
                </button>
            </div>
        </div>
    `,
    styleUrls: ['./recipe-dialog-add-to-shopping-list.component.scss']
})
export class RecipeDialogAddToShoppingListComponent implements OnInit {
    @Input() open: boolean = false;
    @Output() openChange = new EventEmitter<boolean>();
    @Input() recipes: Recipe[] = [];
    @Input() shoppingLists: ShoppingList[] = [];

    form: FormGroup;
    availableShoppingLists: ShoppingList[] = [];
    selectedIngredients: any[] = [];

    constructor(
        private fb: FormBuilder,
        private shoppingListService: ShoppingListService,
        public dialogRef: MatDialogRef<RecipeDialogAddToShoppingListComponent>,
        @Inject(MAT_DIALOG_DATA) public data?: AddToShoppingListData
    ) {
        this.form = this.fb.group({
            shoppingListId: ['', Validators.required],
            notes: ['']
        });
    }

    get recipeNames(): string {
        if (this.data?.recipe) {
            return this.data.recipe.name;
        }
        if (this.recipes.length > 0) {
            return this.recipes.map(r => r.name).join(', ');
        }
        return 'Recipe';
    }

    get allIngredients(): any[] {
        if (this.data?.recipe) {
            return this.data.recipe.ingredients || [];
        }
        if (this.recipes.length > 0) {
            return this.recipes.flatMap(r => r.ingredients || []);
        }
        return [];
    }

    ngOnInit(): void {
        this.loadShoppingLists();
        this.selectedIngredients = [...this.allIngredients];
    }

    loadShoppingLists(): void {
        if (this.data) {
            // Dialog mode - load from service
            this.shoppingListService.getShoppingLists().subscribe({
                next: (lists) => {
                    this.availableShoppingLists = lists.items || lists;
                },
                error: (error) => {
                    console.error('Error loading shopping lists:', error);
                }
            });
        } else {
            // Component mode - use input
            this.availableShoppingLists = this.shoppingLists || [];
        }
    }

    isIngredientSelected(ingredient: any): boolean {
        return this.selectedIngredients.some(selected =>
            selected.food === ingredient.food &&
            selected.note === ingredient.note
        );
    }

    onIngredientToggle(ingredient: any, checked: boolean): void {
        if (checked) {
            if (!this.isIngredientSelected(ingredient)) {
                this.selectedIngredients.push(ingredient);
            }
        } else {
            this.selectedIngredients = this.selectedIngredients.filter(selected =>
                !(selected.food === ingredient.food && selected.note === ingredient.note)
            );
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onAdd(): void {
        if (this.form.valid && this.selectedIngredients.length > 0) {
            const formData = {
                ...this.form.value,
                ingredients: this.selectedIngredients,
                notes: this.form.get('notes')?.value || ''
            };
            this.dialogRef.close(formData);
        }
    }
}

