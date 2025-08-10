import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

export interface ChipItem {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

@Component({
    selector: 'app-recipe-chips',
    standalone: true,
    imports: [CommonModule, MatChipsModule, RouterModule],
    templateUrl: './recipe-chips.component.html',
    styleUrls: ['./recipe-chips.component.scss']
})
export class RecipeChipsComponent {
    @Input() items: ChipItem[] = [];
    @Input() urlPrefix = '';
} 