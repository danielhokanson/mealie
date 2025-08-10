import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface Recipe {
    id: string;
    name: string;
    lastMade?: Date;
    // ... other recipe properties
}

@Component({
    selector: 'app-recipe-last-made',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './recipe-last-made.component.html',
    styleUrls: ['./recipe-last-made.component.scss']
})
export class RecipeLastMadeComponent {
    @Input() recipe!: Recipe;

    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }
} 