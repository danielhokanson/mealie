import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
    selector: 'app-recipe-card-mobile',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatChipsModule
    ],
    templateUrl: './recipe-card-mobile.component.html',
    styleUrls: ['./recipe-card-mobile.component.scss']
})
export class RecipeCardMobileComponent {
    @Input() name = '';
    @Input() slug = '';
    @Input() description?: string;
    @Input() rating?: number;
    @Input() image?: string;
    @Input() recipeId = '';
    @Input() isFlat = false;
    @Input() vertical = false;
    @Input() disableHighlight = false;

    get displayRating(): number {
        return this.rating || 0;
    }

    get hasImage(): boolean {
        return !!this.image;
    }

    get cardClass(): string {
        const classes = ['recipe-card'];
        if (this.isFlat) classes.push('flat');
        if (this.vertical) classes.push('vertical');
        if (this.disableHighlight) classes.push('no-highlight');
        return classes.join(' ');
    }
} 