import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

import { RecipeCardMobileComponent } from '../recipe-card-mobile/recipe-card-mobile.component';

export interface RecipeSummary {
    id: string;
    name: string;
    description?: string;
    slug: string;
    rating?: number;
    image?: string;
}

@Component({
    selector: 'app-recipe-dialog-search',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule,
        FormsModule,
        RecipeCardMobileComponent
    ],
    templateUrl: './recipe-dialog-search.component.html',
    styleUrls: ['./recipe-dialog-search.component.scss']
})
export class RecipeDialogSearchComponent implements OnInit, OnDestroy {
    @Input() selected = false;
    @Input() open = false;

    @Output() openChange = new EventEmitter<boolean>();
    @Output() selectedRecipe = new EventEmitter<RecipeSummary>();

    dialog = false;
    loading = false;
    selectedIndex = -1;
    searchQuery = '';

    // Mock search data - in a real app, this would come from a search service
    searchResults: RecipeSummary[] = [
        {
            id: '1',
            name: 'Chocolate Chip Cookies',
            description: 'Classic homemade chocolate chip cookies',
            slug: 'chocolate-chip-cookies',
            rating: 4.5,
            image: '/assets/images/cookies.jpg'
        },
        {
            id: '2',
            name: 'Spaghetti Carbonara',
            description: 'Traditional Italian pasta dish',
            slug: 'spaghetti-carbonara',
            rating: 4.2,
            image: '/assets/images/carbonara.jpg'
        },
        {
            id: '3',
            name: 'Chicken Tikka Masala',
            description: 'Creamy and flavorful Indian curry',
            slug: 'chicken-tikka-masala',
            rating: 4.7,
            image: '/assets/images/tikka-masala.jpg'
        }
    ];

    // Mock user data - in a real app, this would come from auth service
    currentUser = {
        groupSlug: 'default-group'
    };

    ngOnInit(): void {
        this.initializeSearch();
    }

    ngOnDestroy(): void {
        this.removeKeyboardListener();
    }

    private initializeSearch(): void {
        // In a real app, you'd initialize the search service here
        // this.searchService.initialize();
    }

    openDialog(): void {
        this.dialog = true;
        this.open = true;
        this.openChange.emit(true);
        this.addKeyboardListener();
    }

    closeDialog(): void {
        this.dialog = false;
        this.open = false;
        this.openChange.emit(false);
        this.resetSearch();
        this.removeKeyboardListener();
    }

    private resetSearch(): void {
        this.searchQuery = '';
        this.selectedIndex = -1;
        this.searchResults = [];
    }

    private addKeyboardListener(): void {
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    private removeKeyboardListener(): void {
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
    }

    @HostListener('document:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        if (!this.dialog) return;

        if (event.key === 'Enter') {
            this.handleEnter();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.selectedIndex--;
            this.selectRecipe();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.selectedIndex++;
            this.selectRecipe();
        }
    }

    private handleEnter(): void {
        if (this.selectedIndex >= 0 && this.selectedIndex < this.searchResults.length) {
            this.handleSelect(this.searchResults[this.selectedIndex]);
        }
    }

    private selectRecipe(): void {
        const recipeCards = document.getElementsByClassName('arrow-nav');
        if (recipeCards) {
            if (this.selectedIndex < 0) {
                this.selectedIndex = -1;
                document.getElementById('arrow-search')?.focus();
                return;
            }

            if (this.selectedIndex >= recipeCards.length) {
                this.selectedIndex = recipeCards.length - 1;
            }

            (recipeCards[this.selectedIndex] as HTMLElement)?.focus();
        }
    }

    handleSelect(recipe: RecipeSummary): void {
        this.closeDialog();
        this.selectedRecipe.emit(recipe);
    }

    onSearchQueryChange(): void {
        // In a real app, you'd trigger search here
        // this.searchService.search(this.searchQuery);
        console.log('Searching for:', this.searchQuery);
    }

    onDialogChange(open: boolean): void {
        this.open = open;
        this.openChange.emit(open);
        if (!open) {
            this.resetSearch();
            this.removeKeyboardListener();
        } else {
            this.addKeyboardListener();
        }
    }
} 