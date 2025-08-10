import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface RecipeRating {
    id: string;
    recipeId: string;
    userId: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

@Component({
    selector: 'app-recipe-rating',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
    templateUrl: './recipe-rating.component.html',
    styleUrls: ['./recipe-rating.component.scss']
})
export class RecipeRatingComponent implements OnInit {
    @Input() recipeId = '';
    @Input() slug = '';
    @Input() modelValue = 0;
    @Input() small = false;
    @Input() emitOnly = false;
    @Input() canRate = true;

    @Output() modelValueChange = new EventEmitter<number>();

    userRating = 0;
    groupRating = 0;
    isHovering = false;
    hoverRating = 0;
    ratingsLoaded = false;

    ngOnInit(): void {
        this.groupRating = this.modelValue;
        this.loadUserRating();
    }

    private async loadUserRating(): Promise<void> {
        if (!this.recipeId) return;

        try {
            // In a real app, you'd call the backend to get user rating
            // For now, we'll simulate loading
            this.ratingsLoaded = true;

            // Simulate API call to get user rating
            // const rating = await this.recipeService.getUserRating(this.recipeId);
            // this.userRating = rating?.rating || 0;
        } catch (error) {
            console.error('Failed to load user rating:', error);
        }
    }

    updateRating(rating: number): void {
        if (!this.canRate) return;

        this.userRating = rating;

        if (!this.emitOnly) {
            this.saveRating(rating);
        }

        this.modelValueChange.emit(rating);
    }

    clearRating(): void {
        this.userRating = 0;

        if (!this.emitOnly) {
            this.saveRating(0);
        }

        this.modelValueChange.emit(0);
    }

    private async saveRating(rating: number): Promise<void> {
        if (!this.recipeId) return;

        try {
            // In a real app, you'd call the backend to save the rating
            // await this.recipeService.saveRating(this.recipeId, rating);
            console.log('Rating saved:', rating);
        } catch (error) {
            console.error('Failed to save rating:', error);
        }
    }

    getStarIcon(starNumber: number): string {
        if (this.groupRating >= starNumber) {
            return 'star';
        } else if (this.groupRating >= starNumber - 0.5) {
            return 'star_half';
        } else {
            return 'star_border';
        }
    }

    getRatingColor(): string {
        if (this.userRating || this.hoverRating) {
            return 'accent';
        }
        return 'grey';
    }
} 