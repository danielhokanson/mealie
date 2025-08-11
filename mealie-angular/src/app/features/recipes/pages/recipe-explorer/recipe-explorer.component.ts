import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { RecipeService } from '../../../../core/services/recipe.service';
import { Recipe, RecipeSearchParams, RecipeCategory, RecipeTag, RecipeTool, RecipeFood } from '../../../../core/models/recipe.model';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { SearchFilterComponent } from '../../components/search-filter/search-filter.component';

@Component({
    selector: 'app-recipe-explorer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatSelectModule,
        MatCheckboxModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatDividerModule,
        RecipeCardComponent,
        SearchFilterComponent
    ],
    templateUrl: './recipe-explorer.component.html',
    styleUrls: ['./recipe-explorer.component.scss']
})
export class RecipeExplorerComponent implements OnInit, OnDestroy {
    recipes: Recipe[] = [];
    categories: RecipeCategory[] = [];
    tags: RecipeTag[] = [];
    tools: RecipeTool[] = [];
    foods: RecipeFood[] = [];

    searchQuery = '';
    selectedCategories: string[] = [];
    selectedTags: string[] = [];
    selectedTools: string[] = [];
    selectedFoods: string[] = [];

    requireAllCategories = false;
    requireAllTags = false;
    requireAllTools = false;
    requireAllFoods = false;

    orderBy = 'name';
    orderDirection: 'asc' | 'desc' = 'asc';
    autoSearch = true;

    loading = false;
    totalRecipes = 0;
    currentPage = 1;
    pageSize = 20;

    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(private recipeService: RecipeService) {
        this.setupSearchDebounce();
    }

    ngOnInit(): void {
        this.loadFilters();
        this.loadRecipes();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadRecipes();
    }

    onSearchQueryChange(event: Event | string): void {
        if (typeof event === 'string') {
            this.searchQuery = event;
        } else {
            const target = event.target as HTMLInputElement;
            this.searchQuery = target.value;
        }
        this.searchSubject.next(this.searchQuery);
    }

    onFilterChange(): void {
        if (this.autoSearch) {
            this.onSearch();
        }
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadRecipes();
    }

    onSortChange(sortBy: string): void {
        this.orderBy = sortBy;
        this.onSearch();
    }

    onOrderDirectionChange(): void {
        this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
        this.onSearch();
    }

    onReset(): void {
        this.searchQuery = '';
        this.selectedCategories = [];
        this.selectedTags = [];
        this.selectedTools = [];
        this.selectedFoods = [];
        this.requireAllCategories = false;
        this.requireAllTags = false;
        this.requireAllTools = false;
        this.requireAllFoods = false;
        this.orderBy = 'name';
        this.orderDirection = 'asc';
        this.onSearch();
    }

    private setupSearchDebounce(): void {
        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            if (this.autoSearch) {
                this.onSearch();
            }
        });
    }

    private loadFilters(): void {
        this.recipeService.getCategories().subscribe(categories => {
            this.categories = categories;
        });

        this.recipeService.getTags().subscribe(tags => {
            this.tags = tags;
        });

        this.recipeService.getTools().subscribe(tools => {
            this.tools = tools;
        });

        this.recipeService.getFoods().subscribe(foods => {
            this.foods = foods;
        });
    }

    private loadRecipes(): void {
        this.loading = true;

        const params: RecipeSearchParams = {
            search: this.searchQuery || undefined,
            categories: this.selectedCategories.length > 0 ? this.selectedCategories : undefined,
            tags: this.selectedTags.length > 0 ? this.selectedTags : undefined,
            tools: this.selectedTools.length > 0 ? this.selectedTools : undefined,
            foods: this.selectedFoods.length > 0 ? this.selectedFoods : undefined,
            requireAllCategories: this.requireAllCategories,
            requireAllTags: this.requireAllTags,
            requireAllTools: this.requireAllTools,
            requireAllFoods: this.requireAllFoods,
            orderBy: this.orderBy,
            orderDirection: this.orderDirection,
            page: this.currentPage,
            perPage: this.pageSize
        };

        this.recipeService.getRecipes(params).subscribe({
            next: (response) => {
                this.recipes = response.items;
                this.totalRecipes = response.total;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading recipes:', error);
                this.loading = false;
            }
        });
    }

    getCategoryName(id: string): string {
        const category = this.categories.find(c => c.id === id);
        return category ? category.name : id;
    }

    getTagName(id: string): string {
        const tag = this.tags.find(t => t.id === id);
        return tag ? tag.name : id;
    }

    getToolName(id: string): string {
        const tool = this.tools.find(t => t.id === id);
        return tool ? tool.name : id;
    }

    getFoodName(id: string): string {
        const food = this.foods.find(f => f.id === id);
        return food ? food.name : id;
    }

    removeCategory(category: string): void {
        this.selectedCategories = this.selectedCategories.filter(c => c !== category);
        this.onFilterChange();
    }

    removeTag(tag: string): void {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
        this.onFilterChange();
    }

    removeTool(tool: string): void {
        this.selectedTools = this.selectedTools.filter(t => t !== tool);
        this.onFilterChange();
    }

    removeFood(food: string): void {
        this.selectedFoods = this.selectedFoods.filter(f => f !== food);
        this.onFilterChange();
    }
} 