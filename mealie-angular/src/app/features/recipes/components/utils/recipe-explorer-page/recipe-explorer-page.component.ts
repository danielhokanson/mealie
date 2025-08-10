import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';

import { RecipeCardSectionComponent } from '../recipe-card-section/recipe-card-section.component';

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    slug: string;
    rating?: number;
    image?: string;
    tags?: any[];
    categories?: any[];
    tools?: any[];
    foods?: any[];
    createdAt?: string;
    updatedAt?: string;
    lastMade?: string;
}

export interface RecipeSearchQuery {
    search?: string;
    categories?: string[];
    foods?: string[];
    households?: string[];
    tags?: string[];
    tools?: string[];
    requireAllCategories?: boolean;
    requireAllTags?: boolean;
    requireAllTools?: boolean;
    requireAllFoods?: boolean;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    _searchSeed?: string;
}

export interface SearchFilter {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export interface SearchState {
    auto: boolean;
    ready: boolean;
    search: string;
    orderBy: string;
    orderDirection: 'asc' | 'desc';
    requireAllCategories: boolean;
    requireAllTags: boolean;
    requireAllTools: boolean;
    requireAllFoods: boolean;
}

export interface SortableOption {
    name: string;
    value: string;
    icon: string;
}

@Component({
    selector: 'app-recipe-explorer-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatListModule,
        MatCardModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatSelectModule,
        RecipeCardSectionComponent
    ],
    templateUrl: './recipe-explorer-page.component.html',
    styleUrls: ['./recipe-explorer-page.component.scss']
})
export class RecipeExplorerPageComponent implements OnInit, OnDestroy {
    @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;

    // State
    state: SearchState = {
        auto: true,
        ready: false,
        search: '',
        orderBy: 'created_at',
        orderDirection: 'desc',
        requireAllCategories: false,
        requireAllTags: false,
        requireAllTools: false,
        requireAllFoods: false
    };

    // Data
    recipes: Recipe[] = [];
    categories: SearchFilter[] = [];
    tags: SearchFilter[] = [];
    tools: SearchFilter[] = [];
    foods: SearchFilter[] = [];
    households: SearchFilter[] = [];

    // Selected filters
    selectedCategories: SearchFilter[] = [];
    selectedTags: SearchFilter[] = [];
    selectedTools: SearchFilter[] = [];
    selectedFoods: SearchFilter[] = [];
    selectedHouseholds: SearchFilter[] = [];

    // Search query
    passedQuery: RecipeSearchQuery = {};
    passedQueryWithSeed: RecipeSearchQuery = {};

    // Mock user data - in a real app, this would come from auth service
    currentUser = {
        groupSlug: 'default-group'
    };

    // Mock display state - in a real app, this would come from responsive service
    isMobile = false;

    get sortText(): string {
        const sortOption = this.sortable.find(option => option.value === this.state.orderBy);
        return sortOption ? sortOption.name : 'Sort';
    }

    get sortable(): SortableOption[] {
        return [
            { name: 'Created Date', value: 'created_at', icon: 'new_box' },
            { name: 'Updated Date', value: 'updated_at', icon: 'update' },
            { name: 'Name', value: 'name', icon: 'sort_alphabetical' },
            { name: 'Rating', value: 'rating', icon: 'star' },
            { name: 'Last Made', value: 'last_made', icon: 'restaurant' }
        ];
    }

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.initializeComponent();
    }

    ngOnDestroy(): void {
        // Cleanup if needed
    }

    private async initializeComponent(): Promise<void> {
        await this.loadInitialData();
        this.calculatePassedQuery();
        this.state.ready = true;
    }

    private async loadInitialData(): Promise<void> {
        // In a real app, you'd load data from services
        // this.categories = await this.categoryService.getAll();
        // this.tags = await this.tagService.getAll();
        // this.tools = await this.toolService.getAll();
        // this.foods = await this.foodService.getAll();
        // this.households = await this.householdService.getAll();

        // Mock data
        this.categories = [
            { id: '1', name: 'Desserts', slug: 'desserts', color: 'primary' },
            { id: '2', name: 'Main Dishes', slug: 'main-dishes', color: 'accent' },
            { id: '3', name: 'Appetizers', slug: 'appetizers', color: 'warn' }
        ];

        this.tags = [
            { id: '1', name: 'Italian', slug: 'italian', color: 'primary' },
            { id: '2', name: 'Quick', slug: 'quick', color: 'accent' },
            { id: '3', name: 'Vegetarian', slug: 'vegetarian', color: 'warn' }
        ];

        this.tools = [
            { id: '1', name: 'Blender', slug: 'blender' },
            { id: '2', name: 'Oven', slug: 'oven' },
            { id: '3', name: 'Stovetop', slug: 'stovetop' }
        ];

        this.foods = [
            { id: '1', name: 'Chicken', slug: 'chicken' },
            { id: '2', name: 'Pasta', slug: 'pasta' },
            { id: '3', name: 'Cheese', slug: 'cheese' }
        ];

        this.households = [
            { id: '1', name: 'My Household', slug: 'my-household' }
        ];

        // Load initial recipes
        await this.loadRecipes();
    }

    private calculatePassedQuery(): void {
        this.passedQuery = {
            search: this.state.search || '',
            categories: this.toIdArray(this.selectedCategories),
            foods: this.toIdArray(this.selectedFoods),
            households: this.toIdArray(this.selectedHouseholds),
            tags: this.toIdArray(this.selectedTags),
            tools: this.toIdArray(this.selectedTools),
            requireAllCategories: this.state.requireAllCategories,
            requireAllTags: this.state.requireAllTags,
            requireAllTools: this.state.requireAllTools,
            requireAllFoods: this.state.requireAllFoods,
            orderBy: this.state.orderBy,
            orderDirection: this.state.orderDirection
        };

        this.passedQueryWithSeed = {
            ...this.passedQuery,
            _searchSeed: Date.now().toString()
        };
    }

    private toIdArray(items: SearchFilter[]): string[] {
        return items.map(item => item.id);
    }

    private async loadRecipes(): Promise<void> {
        // In a real app, you'd call the backend API
        // const response = await this.recipeService.search(this.passedQuery);
        // this.recipes = response.data;

        // Mock response
        this.recipes = [
            {
                id: '1',
                name: 'Chocolate Chip Cookies',
                description: 'Classic homemade chocolate chip cookies',
                slug: 'chocolate-chip-cookies',
                rating: 4.5,
                image: '/assets/images/cookies.jpg',
                tags: [{ id: '1', name: 'Dessert', slug: 'dessert' }],
                categories: [{ id: '1', name: 'Desserts', slug: 'desserts' }],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T00:00:00Z',
                lastMade: '2024-01-10T00:00:00Z'
            },
            {
                id: '2',
                name: 'Spaghetti Carbonara',
                description: 'Traditional Italian pasta dish',
                slug: 'spaghetti-carbonara',
                rating: 4.2,
                image: '/assets/images/carbonara.jpg',
                tags: [{ id: '2', name: 'Italian', slug: 'italian' }],
                categories: [{ id: '2', name: 'Main Dishes', slug: 'main-dishes' }],
                createdAt: '2024-01-02T00:00:00Z',
                updatedAt: '2024-01-16T00:00:00Z',
                lastMade: '2024-01-12T00:00:00Z'
            }
        ];
    }

    async search(): Promise<void> {
        if (this.state.auto) {
            return;
        }

        this.calculatePassedQuery();
        await this.loadRecipes();
    }

    hideKeyboard(): void {
        if (this.searchInput) {
            this.searchInput.nativeElement.blur();
        }
    }

    toggleOrderDirection(): void {
        this.state.orderDirection = this.state.orderDirection === 'asc' ? 'desc' : 'asc';
        this.calculatePassedQuery();
        this.loadRecipes();
    }

    onOrderByChange(value: string): void {
        this.state.orderBy = value;
        this.calculatePassedQuery();
        this.loadRecipes();
    }

    reset(): void {
        this.state.search = '';
        this.selectedCategories = [];
        this.selectedTags = [];
        this.selectedTools = [];
        this.selectedFoods = [];
        this.selectedHouseholds = [];
        this.state.requireAllCategories = false;
        this.state.requireAllTags = false;
        this.state.requireAllTools = false;
        this.state.requireAllFoods = false;
        this.state.orderBy = 'created_at';
        this.state.orderDirection = 'desc';
        this.state.auto = true;

        this.calculatePassedQuery();
        this.loadRecipes();
    }

    filterItems(): void {
        // Handle item filtering logic
        console.log('Filtering items...');
    }

    replaceRecipes(recipes: Recipe[]): void {
        this.recipes = recipes;
    }

    appendRecipes(recipes: Recipe[]): void {
        this.recipes = [...this.recipes, ...recipes];
    }

    onSearchChange(): void {
        if (this.state.auto) {
            this.calculatePassedQuery();
            this.loadRecipes();
        }
    }

    onFilterChange(): void {
        if (this.state.auto) {
            this.calculatePassedQuery();
            this.loadRecipes();
        }
    }
} 