import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { RecipeService } from '../../core/services/recipe.service';

interface SearchResult {
    id: string;
    name: string;
    type: 'recipe' | 'category' | 'tag';
    description?: string;
    image?: string;
    prepTime?: number;
    cookTime?: number;
    rating?: number;
}

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatAutocompleteModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
    searchControl = new FormControl('');
    activeFilter: string | null = null;
    searchResults: SearchResult[] = [];
    recentSearches: string[] = [];
    popularCategories: any[] = [];
    popularTags: any[] = [];
    loading = false;
    
    selectedCategories: string[] = [];
    selectedTags: string[] = [];
    maxPrepTime?: number;
    minRating?: number;
    
    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>();

    constructor(
        private router: Router,
        private recipeService: RecipeService
    ) { }

    ngOnInit(): void {
        this.loadRecentSearches();
        this.loadPopularFilters();
        
        // Set up search with debounce
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(query => {
                if (query.trim().length === 0) {
                    return of([]);
                }
                this.loading = true;
                return this.performSearch(query);
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (results) => {
                this.searchResults = results;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.searchResults = [];
            }
        });

        // Subscribe to search control changes
        this.searchControl.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(value => {
            if (value) {
                this.searchSubject.next(value);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearch(): void {
        const query = this.searchControl.value;
        if (query && query.trim()) {
            this.saveToRecentSearches(query);
            this.searchSubject.next(query);
        }
    }

    onFilterClick(filterType: string): void {
        this.activeFilter = this.activeFilter === filterType ? null : filterType;
    }

    onResultClick(result: SearchResult): void {
        switch (result.type) {
            case 'recipe':
                this.router.navigate(['/recipes', result.id]);
                break;
            case 'category':
                this.router.navigate(['/recipes'], { 
                    queryParams: { category: result.id } 
                });
                break;
            case 'tag':
                this.router.navigate(['/recipes'], { 
                    queryParams: { tag: result.id } 
                });
                break;
        }
    }

    onCategoryToggle(category: any): void {
        const index = this.selectedCategories.indexOf(category.id);
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            this.selectedCategories.push(category.id);
        }
        this.applyFilters();
    }

    onTagToggle(tag: any): void {
        const index = this.selectedTags.indexOf(tag.id);
        if (index > -1) {
            this.selectedTags.splice(index, 1);
        } else {
            this.selectedTags.push(tag.id);
        }
        this.applyFilters();
    }

    onRecentSearchClick(search: string): void {
        this.searchControl.setValue(search);
        this.onSearch();
    }

    clearSearch(): void {
        this.searchControl.setValue('');
        this.searchResults = [];
        this.selectedCategories = [];
        this.selectedTags = [];
        this.maxPrepTime = undefined;
        this.minRating = undefined;
    }

    private performSearch(query: string): any {
        const params = {
            search: query,
            categories: this.selectedCategories,
            tags: this.selectedTags,
            time: this.maxPrepTime,
            rating: this.minRating
        };

        return this.recipeService.getRecipes(params).pipe(
            switchMap(response => {
                const results: SearchResult[] = response.recipes.map(recipe => ({
                    id: recipe.id,
                    name: recipe.name,
                    type: 'recipe' as const,
                    description: recipe.description,
                    image: recipe.image,
                    prepTime: recipe.prepTime,
                    cookTime: recipe.cookTime,
                    rating: recipe.rating
                }));
                return of(results);
            })
        );
    }

    private applyFilters(): void {
        const query = this.searchControl.value;
        if (query && query.trim()) {
            this.searchSubject.next(query);
        }
    }

    private loadRecentSearches(): void {
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            this.recentSearches = JSON.parse(stored);
        }
    }

    private saveToRecentSearches(query: string): void {
        // Remove if already exists
        const index = this.recentSearches.indexOf(query);
        if (index > -1) {
            this.recentSearches.splice(index, 1);
        }
        
        // Add to beginning
        this.recentSearches.unshift(query);
        
        // Keep only last 10
        if (this.recentSearches.length > 10) {
            this.recentSearches = this.recentSearches.slice(0, 10);
        }
        
        localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    }

    private loadPopularFilters(): void {
        // Load popular categories
        this.recipeService.getCategories().pipe(
            takeUntil(this.destroy$)
        ).subscribe(categories => {
            this.popularCategories = categories.slice(0, 8);
        });

        // Load popular tags
        this.recipeService.getTags().pipe(
            takeUntil(this.destroy$)
        ).subscribe(tags => {
            this.popularTags = tags.slice(0, 8);
        });
    }

    getRatingStars(rating: number): string[] {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('star');
        }
        
        if (hasHalfStar) {
            stars.push('star_half');
        }
        
        while (stars.length < 5) {
            stars.push('star_border');
        }
        
        return stars;
    }

    formatTime(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
} 