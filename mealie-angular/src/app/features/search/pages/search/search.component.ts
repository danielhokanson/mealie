import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatChipsModule,
        MatDividerModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
    searchQuery = '';
    searchResults: any[] = [];
    loading = false;
    selectedFilters: string[] = [];

    constructor() { }

    ngOnInit(): void { }

    onSearch(): void {
        if (!this.searchQuery.trim()) return;

        this.loading = true;
        // TODO: Implement search logic
        setTimeout(() => {
            this.loading = false;
            this.searchResults = [
                {
                    id: '1',
                    type: 'recipe',
                    title: 'Chicken Pasta',
                    description: 'A delicious chicken pasta recipe',
                    tags: ['pasta', 'chicken', 'italian']
                },
                {
                    id: '2',
                    type: 'recipe',
                    title: 'Vegetable Stir Fry',
                    description: 'Healthy vegetable stir fry',
                    tags: ['vegetarian', 'asian', 'healthy']
                }
            ];
        }, 1000);
    }

    onFilterChange(filter: string): void {
        const index = this.selectedFilters.indexOf(filter);
        if (index > -1) {
            this.selectedFilters.splice(index, 1);
        } else {
            this.selectedFilters.push(filter);
        }
        this.applyFilters();
    }

    applyFilters(): void {
        // TODO: Implement filter logic
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.searchResults = [];
        this.selectedFilters = [];
    }
}
