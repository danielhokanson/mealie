import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { RecipeCardMobileComponent } from '../recipe-card-mobile/recipe-card-mobile.component';

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    slug: string;
    rating?: number;
    image?: string;
    tags?: any[];
    createdAt?: string;
    updatedAt?: string;
    lastMade?: string;
}

export interface RecipeSearchQuery {
    queryFilter?: string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    orderByNullPosition?: 'first' | 'last';
}

export interface SortPreferences {
    orderBy: string;
    orderDirection: 'asc' | 'desc';
    sortIcon: string;
    filterNull: boolean;
    useMobileCards: boolean;
}

export interface SortEvent {
    az: string;
    rating: string;
    created: string;
    updated: string;
    lastMade: string;
    shuffle: string;
}

@Component({
    selector: 'app-recipe-card-section',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatListModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        RecipeCardComponent,
        RecipeCardMobileComponent
    ],
    templateUrl: './recipe-card-section.component.html',
    styleUrls: ['./recipe-card-section.component.scss']
})
export class RecipeCardSectionComponent implements OnInit, OnDestroy {
    @Input() disableToolbar = false;
    @Input() disableSort = false;
    @Input() icon?: string | null;
    @Input() title?: string | null;
    @Input() singleColumn = false;
    @Input() recipes: Recipe[] = [];
    @Input() query?: RecipeSearchQuery | null;

    @Output() replaceRecipes = new EventEmitter<Recipe[]>();
    @Output() appendRecipes = new EventEmitter<Recipe[]>();

    // Constants
    readonly EVENTS: SortEvent = {
        az: 'az',
        rating: 'rating',
        created: 'created',
        updated: 'updated',
        lastMade: 'lastMade',
        shuffle: 'shuffle'
    };

    // State
    ready = false;
    loading = false;
    sortLoading = false;
    hasMore = true;
    page = 1;
    perPage = 32;

    // Mock user data - in a real app, this would come from auth service
    currentUser = {
        groupSlug: 'default-group'
    };

    // Mock preferences - in a real app, this would come from user preferences service
    preferences: SortPreferences = {
        orderBy: 'name',
        orderDirection: 'asc',
        sortIcon: 'sort_alphabetical_ascending',
        filterNull: false,
        useMobileCards: false
    };

    // Mock display state - in a real app, this would come from responsive service
    isMobile = false;

    get displayTitleIcon(): string {
        return this.icon || 'local_offer';
    }

    get useMobileCards(): boolean {
        return this.isMobile || this.preferences.useMobileCards;
    }

    get queryFilter(): string | null {
        return this.query?.queryFilter || null;
    }

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.initializeComponent();
    }

    ngOnDestroy(): void {
        // Cleanup if needed
    }

    trackByRecipeId(index: number, recipe: Recipe): string {
        return recipe.id;
    }

    private async initializeComponent(): Promise<void> {
        await this.initRecipes();
        this.ready = true;
    }

    private async initRecipes(): Promise<void> {
        this.page = 1;
        this.hasMore = true;

        // Double-up the first call to avoid a bug with large screens
        const newRecipes = await this.fetchRecipes(this.page + 1);
        if (newRecipes.length < this.perPage) {
            this.hasMore = false;
        }

        // Advance the page since we doubled the first call
        this.page = this.page + 1;

        this.replaceRecipes.emit(newRecipes);
    }

    private async fetchRecipes(pageCount = 1): Promise<Recipe[]> {
        const orderDir = this.query?.orderDirection || this.preferences.orderDirection;
        const orderByNullPosition = this.query?.orderByNullPosition || (orderDir === 'asc' ? 'first' : 'last');

        // In a real app, you'd call the backend API
        // const response = await this.recipeService.getRecipes({
        //   page: this.page,
        //   perPage: this.perPage * pageCount,
        //   orderBy: this.query?.orderBy || this.preferences.orderBy,
        //   orderDirection: orderDir,
        //   orderByNullPosition,
        //   query: this.query,
        //   queryFilter: this.queryFilter
        // });

        // Mock response
        const mockRecipes: Recipe[] = [
            {
                id: '1',
                name: 'Chocolate Chip Cookies',
                description: 'Classic homemade chocolate chip cookies',
                slug: 'chocolate-chip-cookies',
                rating: 4.5,
                image: '/assets/images/cookies.jpg',
                tags: [{ id: '1', name: 'Dessert', slug: 'dessert' }],
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
                createdAt: '2024-01-02T00:00:00Z',
                updatedAt: '2024-01-16T00:00:00Z',
                lastMade: '2024-01-12T00:00:00Z'
            }
        ];

        return mockRecipes;
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(): void {
        this.handleInfiniteScroll();
    }

    private async handleInfiniteScroll(): Promise<void> {
        if (!this.hasMore || this.loading) {
            return;
        }

        // Simple scroll detection - in a real app, you'd use Intersection Observer
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= documentHeight - 100) {
            await this.loadMoreRecipes();
        }
    }

    private async loadMoreRecipes(): Promise<void> {
        this.loading = true;
        this.page = this.page + 1;

        const newRecipes = await this.fetchRecipes();
        if (newRecipes.length < this.perPage) {
            this.hasMore = false;
        }
        if (newRecipes.length) {
            this.appendRecipes.emit(newRecipes);
        }

        this.loading = false;
    }

    async sortRecipes(sortType: string): Promise<void> {
        if (this.sortLoading || this.loading) {
            return;
        }

        const setter = (
            orderBy: string,
            ascIcon: string,
            descIcon: string,
            defaultOrderDirection: 'asc' | 'desc' = 'asc',
            filterNull = false
        ) => {
            if (this.preferences.orderBy !== orderBy) {
                this.preferences.orderBy = orderBy;
                this.preferences.orderDirection = defaultOrderDirection;
                this.preferences.filterNull = filterNull;
            } else {
                this.preferences.orderDirection = this.preferences.orderDirection === 'asc' ? 'desc' : 'asc';
            }
            this.preferences.sortIcon = this.preferences.orderDirection === 'asc' ? ascIcon : descIcon;
        };

        switch (sortType) {
            case this.EVENTS.az:
                setter(
                    'name',
                    'sort_alphabetical_ascending',
                    'sort_alphabetical_descending',
                    'asc',
                    false
                );
                break;
            case this.EVENTS.rating:
                setter('rating', 'sort_ascending', 'sort_descending', 'desc', true);
                break;
            case this.EVENTS.created:
                setter(
                    'created_at',
                    'sort_calendar_ascending',
                    'sort_calendar_descending',
                    'desc',
                    false
                );
                break;
            case this.EVENTS.updated:
                setter('updated_at', 'sort_clock_ascending', 'sort_clock_descending', 'desc', false);
                break;
            case this.EVENTS.lastMade:
                setter(
                    'last_made',
                    'sort_calendar_ascending',
                    'sort_calendar_descending',
                    'desc',
                    true
                );
                break;
            default:
                console.log('Unknown Event', sortType);
                return;
        }

        // Reset pagination
        this.page = 1;
        this.hasMore = true;

        this.sortLoading = true;
        this.loading = true;

        // Fetch new recipes
        const newRecipes = await this.fetchRecipes();
        this.replaceRecipes.emit(newRecipes);

        this.sortLoading = false;
        this.loading = false;
    }

    async navigateRandom(): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // const recipe = await this.recipeService.getRandom(this.query, this.queryFilter);

            // Mock random recipe
            const recipe = this.recipes[Math.floor(Math.random() * this.recipes.length)];

            if (!recipe?.slug) {
                return;
            }

            this.router.navigate([`/g/${this.currentUser.groupSlug}/r/${recipe.slug}`]);
        } catch (error) {
            console.error('Failed to navigate to random recipe:', error);
        }
    }

    toggleMobileCards(): void {
        this.preferences.useMobileCards = !this.preferences.useMobileCards;
    }

    get sortMenuItems(): any[] {
        return [
            {
                title: 'Sort Alphabetically',
                icon: 'sort_alphabetical_ascending',
                event: this.EVENTS.az
            },
            {
                title: 'Sort by Rating',
                icon: 'star',
                event: this.EVENTS.rating
            },
            {
                title: 'Sort by Created Date',
                icon: 'new_box',
                event: this.EVENTS.created
            },
            {
                title: 'Sort by Updated Date',
                icon: 'update',
                event: this.EVENTS.updated
            },
            {
                title: 'Sort by Last Made',
                icon: 'restaurant',
                event: this.EVENTS.lastMade
            }
        ];
    }

    get contextMenuItems(): any[] {
        return [
            {
                title: 'Toggle View',
                icon: 'visibility',
                event: 'toggle-dense-view'
            }
        ];
    }

    onContextMenuClick(event: string): void {
        switch (event) {
            case 'toggle-dense-view':
                this.toggleMobileCards();
                break;
        }
    }
} 