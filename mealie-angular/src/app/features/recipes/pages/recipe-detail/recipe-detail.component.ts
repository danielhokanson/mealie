import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RecipeService } from '../../../../core/services/recipe.service';
import { Recipe, RecipeComment, RecipeNote } from '../../../../core/models/recipe.model';

@Component({
    selector: 'app-recipe-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatTabsModule,
        MatDividerModule,
        MatListModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './recipe-detail.component.html',
    styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
    recipe: Recipe | null = null;
    loading = true;
    error = false;
    currentScale = 1;
    selectedTab = 0;
    newComment = '';
    newNote = '';
    showAddNote = false;
    showAddComment = false;

    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private recipeService: RecipeService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        const recipeId = this.route.snapshot.paramMap.get('id');
        if (recipeId) {
            this.loadRecipe(recipeId);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public loadRecipe(recipeId: string): void {
        this.loading = true;
        this.error = false;

        this.recipeService.getRecipe(recipeId).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (recipe) => {
                this.recipe = recipe;
                this.currentScale = recipe.scale || 1;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading recipe:', error);
                this.error = true;
                this.loading = false;
            }
        });
    }

    onEditRecipe(): void {
        if (this.recipe) {
            this.router.navigate(['/recipes', this.recipe.id, 'edit']);
        }
    }

    onDeleteRecipe(): void {
        if (this.recipe && confirm('Are you sure you want to delete this recipe?')) {
            this.recipeService.deleteRecipe(this.recipe.id).subscribe({
                next: () => {
                    this.snackBar.open('Recipe deleted successfully', 'Close', {
                        duration: 3000
                    });
                    this.router.navigate(['/recipes']);
                },
                error: (error) => {
                    console.error('Error deleting recipe:', error);
                    this.snackBar.open('Failed to delete recipe', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }

    onShareRecipe(): void {
        if (this.recipe) {
            this.recipeService.shareRecipe(this.recipe.id, {}).subscribe({
                next: (response) => {
                    this.snackBar.open(response.message || 'Recipe shared successfully', 'Close', {
                        duration: 3000
                    });
                },
                error: (error) => {
                    console.error('Error sharing recipe:', error);
                    this.snackBar.open('Failed to share recipe', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }

    onPrintRecipe(): void {
        if (this.recipe) {
            window.print();
        }
    }

    onToggleFavorite(): void {
        if (this.recipe) {
            if (this.recipe.favorite) {
                this.recipeService.removeFromFavorites(this.recipe.id).subscribe({
                    next: () => {
                        this.recipe!.favorite = false;
                        this.snackBar.open('Removed from favorites', 'Close', {
                            duration: 2000
                        });
                    },
                    error: (error) => {
                        console.error('Error removing from favorites:', error);
                    }
                });
            } else {
                this.recipeService.addToFavorites(this.recipe.id).subscribe({
                    next: () => {
                        this.recipe!.favorite = true;
                        this.snackBar.open('Added to favorites', 'Close', {
                            duration: 2000
                        });
                    },
                    error: (error) => {
                        console.error('Error adding to favorites:', error);
                    }
                });
            }
        }
    }

    onScaleChange(scale: number | any): void {
        // Handle both number and event types
        let scaleValue: number;
        if (typeof scale === 'number') {
            scaleValue = scale;
        } else if (scale && typeof scale === 'object' && 'value' in scale) {
            scaleValue = scale.value;
        } else {
            console.warn('Unexpected scale value:', scale);
            return;
        }

        this.currentScale = scaleValue;
        if (this.recipe) {
            this.recipeService.scaleRecipe(this.recipe.id, scaleValue).subscribe({
                next: (scaledRecipe) => {
                    this.recipe = scaledRecipe;
                },
                error: (error) => {
                    console.error('Error scaling recipe:', error);
                }
            });
        }
    }

    onAddComment(): void {
        if (this.recipe && this.newComment.trim()) {
            this.recipeService.createRecipeComment(this.recipe.id, {
                text: this.newComment.trim()
            }).subscribe({
                next: (comment) => {
                    if (!this.recipe!.comments) {
                        this.recipe!.comments = [];
                    }
                    this.recipe!.comments.push(comment);
                    this.newComment = '';
                    this.showAddComment = false;
                    this.snackBar.open('Comment added successfully', 'Close', {
                        duration: 2000
                    });
                },
                error: (error) => {
                    console.error('Error adding comment:', error);
                    this.snackBar.open('Failed to add comment', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }

    onAddNote(): void {
        if (this.recipe && this.newNote.trim()) {
            this.recipeService.createRecipeNote(this.recipe.id, {
                title: 'Note',
                text: this.newNote.trim()
            }).subscribe({
                next: (note) => {
                    this.recipe!.notes.push(note);
                    this.newNote = '';
                    this.showAddNote = false;
                    this.snackBar.open('Note added successfully', 'Close', {
                        duration: 2000
                    });
                },
                error: (error) => {
                    console.error('Error adding note:', error);
                    this.snackBar.open('Failed to add note', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }

    onRateRecipe(rating: number): void {
        if (this.recipe) {
            this.recipeService.saveRecipeRating(this.recipe.id, rating).subscribe({
                next: (newRating) => {
                    this.recipe!.rating = newRating;
                    this.snackBar.open('Rating saved successfully', 'Close', {
                        duration: 2000
                    });
                },
                error: (error) => {
                    console.error('Error saving rating:', error);
                    this.snackBar.open('Failed to save rating', 'Close', {
                        duration: 3000
                    });
                }
            });
        }
    }

    getFormattedTime(): string {
        if (!this.recipe) return '';

        const hours = Math.floor(this.recipe.totalTime / 60);
        const minutes = this.recipe.totalTime % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    getRatingStars(): number[] {
        if (!this.recipe?.rating) return Array(5).fill(0);
        return Array.from({ length: 5 }, (_, i) => i < this.recipe!.rating! ? 1 : 0);
    }

    getScaledQuantity(quantity: number): number {
        return quantity * this.currentScale;
    }
} 