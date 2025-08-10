import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { Recipe, RecipeComment } from '../../../../core/models/recipe.model';
import { User } from '../../../../core/models/user.model';
import { RecipeService } from '../../../../core/services/recipe.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-recipe-comments',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatChipsModule,
        MatListModule,
        MatDividerModule,
        MatMenuModule,
        MatTooltipModule,
        MatExpansionModule,
        MatPaginatorModule
    ],
    templateUrl: './recipe-comments.component.html',
    styleUrls: ['./recipe-comments.component.scss']
})
export class RecipeCommentsComponent implements OnInit, OnDestroy {
    @Input() recipe: Recipe | null = null;

    loading = false;
    comments: RecipeComment[] = [];
    commentForm: FormGroup;
    editingComment: RecipeComment | null = null;
    showAddComment = false;
    sortBy: 'newest' | 'oldest' | 'rating' = 'newest';
    filterRating: number | null = null;
    currentUser: User | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private recipeService: RecipeService,
        private authService: AuthService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadComments();
        this.loadCurrentUser();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.commentForm = this.fb.group({
            text: ['', [Validators.required, Validators.minLength(10)]],
            rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
            isPublic: [true]
        });
    }

    private loadComments(): void {
        if (this.recipe?.slug) {
            this.loading = true;

            this.recipeService.getRecipeComments(this.recipe.slug)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (comments) => {
                        this.comments = comments;
                        this.sortComments();
                        this.loading = false;
                    },
                    error: (error) => {
                        console.error('Error loading comments:', error);
                        this.snackBar.open('Error loading comments', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
        }
    }

    private loadCurrentUser(): void {
        this.currentUser = this.authService.currentUser;
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.currentUser = user;
            });
    }

    onAddComment(): void {
        this.editingComment = null;
        this.commentForm.reset();
        this.commentForm.patchValue({
            rating: 5,
            isPublic: true
        });
        this.showAddComment = true;
    }

    onEditComment(comment: RecipeComment): void {
        this.editingComment = comment;
        this.commentForm.patchValue({
            text: comment.text,
            rating: comment.rating,
            isPublic: comment.isPublic
        });
        this.showAddComment = true;
    }

    onSaveComment(): void {
        if (this.commentForm.valid && this.recipe?.slug) {
            this.loading = true;
            const commentData = this.commentForm.value;

            if (this.editingComment) {
                // Update existing comment
                this.recipeService.updateRecipeComment(this.editingComment.id, commentData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (updatedComment) => {
                            const index = this.comments.findIndex(c => c.id === this.editingComment!.id);
                            if (index !== -1) {
                                this.comments[index] = updatedComment;
                            }
                            this.loading = false;
                            this.snackBar.open('Comment updated successfully', 'Close', { duration: 3000 });
                            this.showAddComment = false;
                        },
                        error: (error) => {
                            console.error('Error updating comment:', error);
                            this.snackBar.open('Error updating comment', 'Close', { duration: 3000 });
                            this.loading = false;
                        }
                    });
            } else {
                // Create new comment
                this.recipeService.createRecipeComment(this.recipe.slug, commentData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (newComment) => {
                            this.comments.unshift(newComment);
                            this.loading = false;
                            this.snackBar.open('Comment added successfully', 'Close', { duration: 3000 });
                            this.showAddComment = false;
                        },
                        error: (error) => {
                            console.error('Error creating comment:', error);
                            this.snackBar.open('Error adding comment', 'Close', { duration: 3000 });
                            this.loading = false;
                        }
                    });
            }
        }
    }

    onDeleteComment(comment: RecipeComment): void {
        if (confirm('Are you sure you want to delete this comment?')) {
            this.loading = true;

            this.recipeService.deleteRecipeComment(comment.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.comments = this.comments.filter(c => c.id !== comment.id);
                        this.loading = false;
                        this.snackBar.open('Comment deleted successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error deleting comment:', error);
                        this.snackBar.open('Error deleting comment', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
        }
    }

    onCancel(): void {
        this.showAddComment = false;
        this.editingComment = null;
    }

    onSortChange(sortBy: 'newest' | 'oldest' | 'rating'): void {
        this.sortBy = sortBy;
        this.sortComments();
    }

    onFilterRating(rating: number | null): void {
        this.filterRating = rating;
    }

    private sortComments(): void {
        this.comments.sort((a, b) => {
            switch (this.sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'rating':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });
    }

    getFilteredComments(): RecipeComment[] {
        let filtered = this.comments;

        if (this.filterRating !== null) {
            filtered = filtered.filter(comment => comment.rating === this.filterRating);
        }

        return filtered;
    }

    getRatingStars(rating: number): boolean[] {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rating);
        }
        return stars;
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getRelativeDate(date: Date): string {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
    }

    canEditComment(comment: RecipeComment): boolean {
        return this.currentUser && (
            comment.user.id === this.currentUser.id ||
            this.currentUser.role === 'admin'
        );
    }

    canDeleteComment(comment: RecipeComment): boolean {
        return this.currentUser && (
            comment.user.id === this.currentUser.id ||
            this.currentUser.role === 'admin'
        );
    }

    getErrorMessage(fieldName: string): string {
        const field = this.commentForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        if (field?.hasError('min')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['min'].min}`;
        }
        if (field?.hasError('max')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${field?.errors?.['max'].max}`;
        }
        return '';
    }

    getAverageRating(): number {
        if (this.comments.length === 0) return 0;
        const totalRating = this.comments.reduce((sum, comment) => sum + comment.rating, 0);
        return Math.round((totalRating / this.comments.length) * 10) / 10;
    }

    getRatingColor(rating: number): string {
        if (rating >= 4) return '#4caf50';
        if (rating >= 3) return '#ff9800';
        return '#f44336';
    }
} 