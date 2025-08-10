import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-recipe-favorite-badge',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './recipe-favorite-badge.component.html',
    styleUrls: ['./recipe-favorite-badge.component.scss']
})
export class RecipeFavoriteBadgeComponent {
    @Input() recipeId = '';
    @Input() showAlways = false;
    @Input() buttonStyle = false;
    @Input() isFavorite = false;

    @Output() favoriteChange = new EventEmitter<boolean>();

    get tooltipText(): string {
        return this.isFavorite ? 'Remove from favorites' : 'Add to favorites';
    }

    get tooltipColor(): string {
        return this.buttonStyle ? 'primary' : 'accent';
    }

    get buttonColor(): string {
        return this.buttonStyle ? 'primary' : 'accent';
    }

    get iconColor(): string {
        return this.buttonStyle ? 'white' : 'accent';
    }

    get iconSize(): string {
        return this.buttonStyle ? 'large' : 'medium';
    }

    get heartIcon(): string {
        return this.isFavorite ? 'favorite' : 'favorite_border';
    }

    get shouldShow(): boolean {
        return this.isFavorite || this.showAlways;
    }

    toggleFavorite(): void {
        this.isFavorite = !this.isFavorite;
        this.favoriteChange.emit(this.isFavorite);
    }
} 