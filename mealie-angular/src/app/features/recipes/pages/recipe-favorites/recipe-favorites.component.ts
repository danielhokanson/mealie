import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RecipeService } from '../../../../core/services/recipe.service';
import { Recipe, RecipeCategory, RecipeTag, RecipeTool, RecipeFood } from '../../../../core/models/recipe.model';

@Component({
    selector: 'app-recipe-favorites',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatSliderModule,
        MatExpansionModule,
        FormsModule
    ],
    templateUrl: './recipe-favorites.component.html',
    styleUrls: ['./recipe-favorites.component.scss']
})
export class RecipeFavoritesComponent implements OnInit, OnDestroy {
    favoriteRecipes: Recipe[] = [];
    loading = true;
    error = false;
    searchQuery = '';
    selectedCategories: string[] = [];
    selectedTags: string[] = [];
    selectedTools: string[] = [];
    selectedFoods: string[] = [];
    orderBy = 'name';
    orderDirection: 'asc' | 'desc' = 'asc';
    showFilters = false;

    categories: RecipeCategory[] = [];
    tags: RecipeTag[] = [];
    tools: RecipeTool[] = [];
    foods: RecipeFood[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private recipeService: RecipeService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadFavoriteRecipes();
        this.loadFilterData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadFavoriteRecipes(): void {
        this.loading = true;
        this.error = false;

        this.recipeService.getFavoriteRecipes().pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (recipes) => {
                this.favoriteRecipes = recipes;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading favorite recipes:', error);
                this.error = true;
                this.loading = false;
            }
        });
    }

    private loadFilterData(): void {
        // Load categories
        this.recipeService.getCategories().pipe(
            takeUntil(this.destroy$)
        ).subscribe(categories => {
            this.categories = categories;
        });

        // Load tags
        this.recipeService.getTags().pipe(
            takeUntil(this.destroy$)
        ).subscribe(tags => {
            this.tags = tags;
        });

        // Load tools
        this.recipeService.getTools().pipe(
            takeUntil(this.destroy$)
        ).subscribe(tools => {
            this.tools = tools;
        });

        // Load foods
        this.recipeService.getFoods().pipe(
            takeUntil(this.destroy$)
        ).subscribe(foods => {
            this.foods = foods;
        });
    }

    onSearch(): void {
        // Implement search functionality
        this.loadFavoriteRecipes();
    }

    onClearSearch(): void {
        this.searchQuery = '';
        this.selectedCategories = [];
        this.selectedTags = [];
        this.selectedTools = [];
        this.selectedFoods = [];
        this.loadFavoriteRecipes();
    }

    onCategoryToggle(categoryId: string): void {
        const index = this.selectedCategories.indexOf(categoryId);
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            this.selectedCategories.push(categoryId);
        }
    }

    onTagToggle(tagId: string): void {
        const index = this.selectedTags.indexOf(tagId);
        if (index > -1) {
            this.selectedTags.splice(index, 1);
        } else {
            this.selectedTags.push(tagId);
        }
    }

    onToolToggle(toolId: string): void {
        const index = this.selectedTools.indexOf(toolId);
        if (index > -1) {
            this.selectedTools.splice(index, 1);
        } else {
            this.selectedTools.push(toolId);
        }
    }

    onFoodToggle(foodId: string): void {
        const index = this.selectedFoods.indexOf(foodId);
        if (index > -1) {
            this.selectedFoods.splice(index, 1);
        } else {
            this.selectedFoods.push(foodId);
        }
    }

    onSortChange(): void {
        // Implement sort functionality
        this.loadFavoriteRecipes();
    }

    onViewRecipe(recipe: Recipe): void {
        this.router.navigate(['/recipes', recipe.id]);
    }

    onRemoveFavorite(recipe: Recipe): void {
        this.recipeService.removeFromFavorites(recipe.id).subscribe({
            next: () => {
                this.favoriteRecipes = this.favoriteRecipes.filter(r => r.id !== recipe.id);
                this.snackBar.open('Removed from favorites', 'Close', {
                    duration: 2000
                });
            },
            error: (error) => {
                console.error('Error removing from favorites:', error);
                this.snackBar.open('Failed to remove from favorites', 'Close', {
                    duration: 3000
                });
            }
        });
    }

    onShareRecipe(recipe: Recipe): void {
        this.recipeService.shareRecipe(recipe.id, {}).subscribe({
            next: (response) => {
                this.snackBar.open(response.message || 'Recipe shared successfully', 'Close', {
                    duration: 3000
                });
            },
            error: (error) => {
                console.error('Error sharing recipe:', error);
                this.snackBar.open('Failed to share recipe', 'Close', {
                    duration: 3000
                });
            }
        });
    }

    onPrintRecipe(recipe: Recipe): void {
        window.open(`/recipes/${recipe.id}/print`, '_blank');
    }

    getFormattedTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    getRatingStars(rating: number): number[] {
        return Array.from({ length: 5 }, (_, i) => i < rating ? 1 : 0);
    }

    getCategoryColor(categoryId: string): string {
        const category = this.categories.find(c => c.id === categoryId);
        return category?.color || '#ccc';
    }

    getTagColor(tagId: string): string {
        const tag = this.tags.find(t => t.id === tagId);
        return tag?.color || '#ccc';
    }
} 