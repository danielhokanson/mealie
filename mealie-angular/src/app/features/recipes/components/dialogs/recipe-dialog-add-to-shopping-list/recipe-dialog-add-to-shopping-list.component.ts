import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';

import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { BasePageTitleComponent } from '../base-page-title/base-page-title.component';
import { BaseButtonGroupComponent } from '../base-button-group/base-button-group.component';
import { RecipeIngredientListItemComponent } from '../recipe-ingredient-list-item/recipe-ingredient-list-item.component';

export interface Recipe {
    id: string;
    name: string;
    slug: string;
    recipeIngredient?: RecipeIngredient[];
    settings?: RecipeSettings;
}

export interface RecipeWithScale extends Recipe {
    scale: number;
}

export interface RecipeIngredient {
    title?: string;
    quantity?: number;
    unit?: any;
    food?: any;
    note?: string;
    originalText?: string;
}

export interface RecipeSettings {
    disableAmount?: boolean;
}

export interface ShoppingListSummary {
    id: string;
    name: string;
    userId: string;
}

export interface ShoppingListIngredient {
    checked: boolean;
    ingredient: RecipeIngredient;
    disableAmount: boolean;
}

export interface ShoppingListIngredientSection {
    sectionName: string;
    ingredients: ShoppingListIngredient[];
}

export interface ShoppingListRecipeIngredientSection {
    recipeId: string;
    recipeName: string;
    recipeScale: number;
    ingredientSections: ShoppingListIngredientSection[];
}

@Component({
    selector: 'app-recipe-dialog-add-to-shopping-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatDividerModule,
        MatListModule,
        FormsModule,
        BaseDialogComponent,
        BasePageTitleComponent,
        BaseButtonGroupComponent,
        RecipeIngredientListItemComponent
    ],
    templateUrl: './recipe-dialog-add-to-shopping-list.component.html',
    styleUrls: ['./recipe-dialog-add-to-shopping-list.component.scss']
})
export class RecipeDialogAddToShoppingListComponent implements OnInit, OnDestroy {
    @Input() recipes?: RecipeWithScale[];
    @Input() shoppingLists: ShoppingListSummary[] = [];
    @Input() open = false;

    @Output() openChange = new EventEmitter<boolean>();

    // Dialog states
    shoppingListDialog = true;
    shoppingListIngredientDialog = false;
    shoppingListShowAllToggled = false;
    ready = false;

    // Data
    recipeIngredientSections: ShoppingListRecipeIngredientSection[] = [];
    selectedShoppingList: ShoppingListSummary | null = null;
    preferences = {
        viewAllLists: false
    };

    // Mock user data - in a real app, this would come from auth service
    currentUser = {
        id: 'current-user-id',
        householdSlug: 'default-household'
    };

    get shoppingListChoices(): ShoppingListSummary[] {
        return this.shoppingLists.filter(list =>
            this.preferences.viewAllLists || list.userId === this.currentUser.id
        );
    }

    get userHousehold(): string {
        return this.currentUser.householdSlug;
    }

    ngOnInit(): void {
        this.initializeDialog();
    }

    ngOnDestroy(): void {
        this.initState();
    }

    private initializeDialog(): void {
        if (this.shoppingListChoices.length === 1 && !this.shoppingListShowAllToggled) {
            this.selectedShoppingList = this.shoppingListChoices[0];
            this.openShoppingListIngredientDialog(this.selectedShoppingList);
        } else {
            this.ready = true;
        }
    }

    private initState(): void {
        this.shoppingListDialog = true;
        this.shoppingListIngredientDialog = false;
        this.shoppingListShowAllToggled = false;
        this.ready = false;
        this.recipeIngredientSections = [];
        this.selectedShoppingList = null;
    }

    openShoppingListIngredientDialog(shoppingList: ShoppingListSummary): void {
        this.selectedShoppingList = shoppingList;
        this.shoppingListDialog = false;
        this.shoppingListIngredientDialog = true;
        this.consolidateRecipesIntoSections();
    }

    async consolidateRecipesIntoSections(): Promise<void> {
        if (!this.recipes) return;

        const recipeSectionMap = new Map<string, ShoppingListRecipeIngredientSection>();

        for (const recipe of this.recipes) {
            if (!recipe.slug) continue;

            if (recipeSectionMap.has(recipe.slug)) {
                const existingSection = recipeSectionMap.get(recipe.slug);
                if (existingSection) {
                    existingSection.recipeScale += recipe.scale;
                }
                continue;
            }

            if (!(recipe.id && recipe.name && recipe.recipeIngredient)) {
                // In a real app, you'd fetch the recipe data
                // const recipeData = await this.recipeService.getOne(recipe.slug);
                // recipe.id = recipeData.id;
                // recipe.name = recipeData.name;
                // recipe.recipeIngredient = recipeData.recipeIngredient;
                continue;
            }

            if (!recipe.recipeIngredient?.length) continue;

            const shoppingListIngredients: ShoppingListIngredient[] = recipe.recipeIngredient.map((ing) => {
                const householdsWithFood = (ing.food?.householdsWithIngredientFood || []);
                return {
                    checked: !householdsWithFood.includes(this.userHousehold),
                    ingredient: ing,
                    disableAmount: recipe.settings?.disableAmount || false,
                };
            });

            let currentTitle = '';
            const shoppingListIngredientSections = shoppingListIngredients.reduce((sections, ing) => {
                if (ing.ingredient.title) {
                    currentTitle = ing.ingredient.title;
                    sections.push({
                        sectionName: currentTitle,
                        ingredients: [ing]
                    });
                } else {
                    if (sections.length === 0) {
                        sections.push({
                            sectionName: '',
                            ingredients: [ing]
                        });
                    } else {
                        sections[sections.length - 1].ingredients.push(ing);
                    }
                }
                return sections;
            }, [] as ShoppingListIngredientSection[]);

            recipeSectionMap.set(recipe.slug, {
                recipeId: recipe.id,
                recipeName: recipe.name,
                recipeScale: recipe.scale,
                ingredientSections: shoppingListIngredientSections
            });
        }

        this.recipeIngredientSections = Array.from(recipeSectionMap.values());
    }

    setShowAllToggled(): void {
        this.shoppingListShowAllToggled = true;
    }

    bulkCheckIngredients(event: string): void {
        const checked = event === 'check';
        this.recipeIngredientSections.forEach(section => {
            section.ingredientSections.forEach(ingredientSection => {
                ingredientSection.ingredients.forEach(ingredient => {
                    ingredient.checked = checked;
                });
            });
        });
    }

    async addRecipesToList(): Promise<void> {
        if (!this.selectedShoppingList || !this.recipes) return;

        try {
            const checkedIngredients = this.recipeIngredientSections.flatMap(section =>
                section.ingredientSections.flatMap(ingredientSection =>
                    ingredientSection.ingredients.filter(ingredient => ingredient.checked)
                )
            );

            if (checkedIngredients.length === 0) {
                console.log('No ingredients selected');
                return;
            }

            // In a real app, you'd call the backend API
            // await this.shoppingListService.addRecipesToList(
            //   this.selectedShoppingList.id,
            //   this.recipes,
            //   checkedIngredients
            // );

            console.log('Adding recipes to shopping list:', this.selectedShoppingList.name);
            this.closeDialog();
        } catch (error) {
            console.error('Failed to add recipes to shopping list:', error);
        }
    }

    closeDialog(): void {
        this.open = false;
        this.openChange.emit(false);
        this.initState();
    }

    onDialogChange(open: boolean): void {
        this.open = open;
        this.openChange.emit(open);
        if (!open) {
            this.initState();
        }
    }
} 