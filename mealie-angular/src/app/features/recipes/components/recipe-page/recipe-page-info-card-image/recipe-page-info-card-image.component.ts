import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Recipe {
    id: string;
    name: string;
    image?: string;
    householdId?: string;
    // ... other recipe properties
}

@Component({
    selector: 'app-recipe-page-info-card-image',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './recipe-page-info-card-image.component.html',
    styleUrls: ['./recipe-page-info-card-image.component.scss']
})
export class RecipePageInfoCardImageComponent implements OnInit {
    @Input() recipe!: Recipe;
    @Input() maxWidth?: string;

    hideImage = false;
    imageHeight = 400;
    recipeImageUrl = '';

    ngOnInit(): void {
        this.loadRecipeImage();
        this.setImageHeight();
    }

    private loadRecipeImage(): void {
        if (this.recipe.image) {
            // In a real app, you'd construct the image URL based on your backend
            // this.recipeImageUrl = `/api/media/recipes/${this.recipe.id}/${this.recipe.image}`;

            // For now, use the image URL directly if it's a full URL
            if (this.recipe.image.startsWith('http')) {
                this.recipeImageUrl = this.recipe.image;
            } else {
                // Construct relative URL
                this.recipeImageUrl = `/api/media/recipes/${this.recipe.id}/image`;
            }
        }
    }

    private setImageHeight(): void {
        // Set responsive image height based on screen size
        if (window.innerWidth < 600) {
            this.imageHeight = 200;
        } else {
            this.imageHeight = 400;
        }
    }

    onImageError(): void {
        this.hideImage = true;
    }

    onImageLoad(): void {
        this.hideImage = false;
    }
} 