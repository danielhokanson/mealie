import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { UserAvatarComponent, User } from '../user-avatar/user-avatar.component';
import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';
import { BaseButtonComponent } from '../base-button/base-button.component';

export interface RecipeComment {
    id: string;
    text: string;
    recipeId: string;
    userId: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}

export interface Recipe {
    id: string;
    name: string;
    comments: RecipeComment[];
    // ... other recipe properties
}

@Component({
    selector: 'app-recipe-page-comments',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        UserAvatarComponent,
        SafeMarkdownComponent,
        BaseButtonComponent
    ],
    templateUrl: './recipe-page-comments.component.html',
    styleUrls: ['./recipe-page-comments.component.scss']
})
export class RecipePageCommentsComponent {
    @Input() recipe!: Recipe;
    @Input() currentUser!: User;
    @Input() canDeleteComments = false;

    @Output() commentAdded = new EventEmitter<RecipeComment>();
    @Output() commentDeleted = new EventEmitter<string>();

    commentForm: FormGroup;
    submitting = false;

    constructor(private fb: FormBuilder) {
        this.commentForm = this.fb.group({
            text: ['', [Validators.required, Validators.maxLength(1000)]]
        });
    }

    get commentText() {
        return this.commentForm.get('text')?.value || '';
    }

    get canSubmit(): boolean {
        return this.commentForm.valid && !this.submitting && this.currentUser?.id;
    }

    get canDeleteComment(): (comment: RecipeComment) => boolean {
        return (comment: RecipeComment) => {
            return this.canDeleteComments ||
                (this.currentUser?.id === comment.userId) ||
                this.currentUser?.admin === true;
        };
    }

    async submitComment(): Promise<void> {
        if (!this.canSubmit) return;

        this.submitting = true;
        const text = this.commentText;

        try {
            // In a real app, you'd call the backend to create the comment
            // const comment = await this.recipeService.createComment(this.recipe.id, { text });

            // Simulate API call
            const comment: RecipeComment = {
                id: Date.now().toString(),
                text: text,
                recipeId: this.recipe.id,
                userId: this.currentUser.id,
                user: this.currentUser,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.commentAdded.emit(comment);
            this.commentForm.reset();
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            this.submitting = false;
        }
    }

    async deleteComment(commentId: string): Promise<void> {
        try {
            // In a real app, you'd call the backend to delete the comment
            // await this.recipeService.deleteComment(commentId);

            this.commentDeleted.emit(commentId);
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    }

    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    getFormErrors(): string[] {
        const textControl = this.commentForm.get('text');
        if (!textControl || !textControl.errors || !textControl.touched) return [];

        const errors: string[] = [];

        if (textControl.errors['required']) {
            errors.push('Comment text is required');
        }

        if (textControl.errors['maxlength']) {
            const requiredLength = textControl.errors['maxlength'].requiredLength;
            errors.push(`Maximum length is ${requiredLength} characters`);
        }

        return errors;
    }
} 