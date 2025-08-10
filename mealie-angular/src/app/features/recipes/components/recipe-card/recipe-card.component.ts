import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { RecipeFavoriteBadgeComponent } from '../utils/recipe-favorite-badge/recipe-favorite-badge.component';
import { RecipeRatingComponent } from '../recipe-rating/recipe-rating.component';
import { RecipeChipsComponent } from '../utils/recipe-chips/recipe-chips.component';
import { RecipeContextMenuComponent } from '../utils/recipe-context-menu/recipe-context-menu.component';
import { SafeMarkdownComponent } from '../../../../shared/components/utils/safe-markdown/safe-markdown.component';

export interface RecipeTag {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

@Component({
    selector: 'app-recipe-card',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        RecipeFavoriteBadgeComponent,
        RecipeRatingComponent,
        RecipeChipsComponent,
        RecipeContextMenuComponent,
        SafeMarkdownComponent
    ],
    templateUrl: './recipe-card.component.html',
    styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
    @Input() name = '';
    @Input() slug = '';
    @Input() description?: string | null;
    @Input() rating = 0;
    @Input() ratingColor = 'secondary';
    @Input() image = 'abc123';
    @Input() tags: RecipeTag[] = [];
    @Input() recipeId = '';
    @Input() imageHeight = 200;
    @Input() isOwnGroup = false;
    @Output() click = new EventEmitter<void>();
    @Output() delete = new EventEmitter<string>();

    isHovering = false;

    // Mock user data - in a real app, this would come from auth service
    currentUser = {
        groupSlug: 'default-group'
    };

    get showRecipeContent(): boolean {
        return !!(this.recipeId && this.slug);
    }

    get recipeRoute(): string {
        return this.showRecipeContent ? `/g/${this.currentUser.groupSlug}/r/${this.slug}` : '';
    }

    get cursor(): string {
        return this.showRecipeContent ? 'pointer' : 'auto';
    }

    constructor(private router: Router) { }

    @HostListener('mouseenter')
    onMouseEnter(): void {
        this.isHovering = true;
    }

    @HostListener('mouseleave')
    onMouseLeave(): void {
        this.isHovering = false;
    }

    onCardClick(): void {
        if (this.showRecipeContent) {
            this.router.navigate([this.recipeRoute]);
        }
        this.click.emit();
    }

    onDelete(slug: string): void {
        this.delete.emit(slug);
    }

    get contextMenuItems(): any {
        return {
            delete: false,
            edit: false,
            download: true,
            mealplanner: true,
            shoppingList: true,
            print: false,
            printPreferences: false,
            share: true
        };
    }
} 