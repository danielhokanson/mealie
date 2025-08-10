import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

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
        FormsModule
    ],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent {
    searchQuery = '';
    activeFilter: string | null = null;
    searchResults: any[] = [];

    onSearch(): void {
        console.log('Searching for:', this.searchQuery);
        // Simulate search results
        this.searchResults = [
            { id: 1, name: 'Spaghetti Carbonara', type: 'recipe' },
            { id: 2, name: 'Chicken Tikka Masala', type: 'recipe' },
            { id: 3, name: 'Chocolate Chip Cookies', type: 'recipe' }
        ];
    }

    onFilterClick(filterType: string): void {
        console.log('Filter clicked:', filterType);
        this.activeFilter = this.activeFilter === filterType ? null : filterType;

        // Simulate filter action
        switch (filterType) {
            case 'categories':
                this.showCategories();
                break;
            case 'tags':
                this.showTags();
                break;
            case 'tools':
                this.showTools();
                break;
            case 'foods':
                this.showFoods();
                break;
            case 'created':
                this.showCreated();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    onResultClick(result: any): void {
        console.log('Result clicked:', result);
        // Navigate to recipe detail or perform action
    }

    private showCategories(): void {
        console.log('Showing categories');
        // Add category filter logic here
    }

    private showTags(): void {
        console.log('Showing tags');
        // Add tag filter logic here
    }

    private showTools(): void {
        console.log('Showing tools');
        // Add tools filter logic here
    }

    private showFoods(): void {
        console.log('Showing foods');
        // Add foods filter logic here
    }

    private showCreated(): void {
        console.log('Showing created date filter');
        // Add created date filter logic here
    }

    private showSettings(): void {
        console.log('Opening settings');
        // Add settings logic here
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.searchResults = [];
        this.activeFilter = null;
    }
} 