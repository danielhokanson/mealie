import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface RecipeIngredient {
    id: string;
    title?: string;
    note?: string;
    unit?: string;
    food?: string;
    disableAmount?: boolean;
    quantity: number;
    referenceId?: string;
}

@Component({
    selector: 'app-recipe-ingredients',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule],
    templateUrl: './recipe-ingredients.component.html',
    styleUrls: ['./recipe-ingredients.component.scss']
})
export class RecipeIngredientsComponent {
    @Input() value: RecipeIngredient[] = [];
    @Input() scale = 1;
    @Input() disableAmount = false;
    @Input() isCookMode = false;
} 