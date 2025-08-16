import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../../../../core/models/recipe.model';

export interface ShareRecipeData {
    recipe: Recipe;
}

@Component({
    selector: 'app-recipe-dialog-share',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatChipsModule,
        MatIconModule
    ],
    template: `
        <div class="dialog-container">
            <h2 mat-dialog-title>Share Recipe</h2>
            
            <div mat-dialog-content>
                <p><strong>{{ recipeName }}</strong></p>
                
                <form [formGroup]="form" class="form-container">
                    <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Share Method</mat-label>
                        <mat-select formControlName="shareMethod" required>
                            <mat-option value="link">Share Link</mat-option>
                            <mat-option value="email">Email</mat-option>
                            <mat-option value="social">Social Media</mat-option>
                            <mat-option value="embed">Embed Code</mat-option>
                        </mat-select>
                    </mat-form-field>

                    <div *ngIf="form.get('shareMethod')?.value === 'email'" class="email-section">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Recipient Email</mat-label>
                            <input matInput formControlName="recipientEmail" type="email" placeholder="Enter email address">
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Subject</mat-label>
                            <input matInput formControlName="emailSubject" placeholder="Recipe shared from Mealie">
                        </mat-form-field>
                        
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Message</mat-label>
                            <textarea matInput formControlName="emailMessage" rows="3" placeholder="Optional personal message..."></textarea>
                        </mat-form-field>
                    </div>

                    <div *ngIf="form.get('shareMethod')?.value === 'link'" class="link-section">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Share Link</mat-label>
                            <input matInput [value]="shareLink" readonly>
                            <button mat-icon-button matSuffix (click)="copyLink()" type="button">
                                <mat-icon>content_copy</mat-icon>
                            </button>
                        </mat-form-field>
                        
                        <mat-checkbox formControlName="publicLink">
                            Make this link publicly accessible
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="allowComments">
                            Allow comments on shared recipe
                        </mat-checkbox>
                    </div>

                    <div *ngIf="form.get('shareMethod')?.value === 'social'" class="social-section">
                        <h3>Share to Social Media</h3>
                        <div class="social-buttons">
                            <button type="button" mat-raised-button color="primary" (click)="shareToFacebook()">
                                <mat-icon>facebook</mat-icon>
                                Facebook
                            </button>
                            <button type="button" mat-raised-button color="accent" (click)="shareToTwitter()">
                                <mat-icon>twitter</mat-icon>
                                Twitter
                            </button>
                            <button type="button" mat-raised-button color="warn" (click)="shareToPinterest()">
                                <mat-icon>pinterest</mat-icon>
                                Pinterest
                            </button>
                        </div>
                    </div>

                    <div *ngIf="form.get('shareMethod')?.value === 'embed'" class="embed-section">
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Embed Code</mat-label>
                            <textarea matInput [value]="embedCode" readonly rows="4"></textarea>
                            <button mat-icon-button matSuffix (click)="copyEmbedCode()" type="button">
                                <mat-icon>content_copy</mat-icon>
                            </button>
                        </mat-form-field>
                    </div>
                </form>
            </div>
            
            <div mat-dialog-actions>
                <button mat-button (click)="onCancel()">Cancel</button>
                <button mat-raised-button color="primary" (click)="onShare()" [disabled]="!form.valid">
                    Share Recipe
                </button>
            </div>
        </div>
    `,
    styleUrls: ['./recipe-dialog-share.component.scss']
})
export class RecipeDialogShareComponent implements OnInit {
    @Input() open: boolean = false;
    @Output() openChange = new EventEmitter<boolean>();
    @Input() recipeId: string = '';
    @Input() name: string = '';

    form: FormGroup;
    shareLink: string = '';
    embedCode: string = '';

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<RecipeDialogShareComponent>,
        @Inject(MAT_DIALOG_DATA) public data?: ShareRecipeData
    ) {
        this.form = this.fb.group({
            shareMethod: ['link', Validators.required],
            recipientEmail: ['', [Validators.email]],
            emailSubject: ['Recipe shared from Mealie'],
            emailMessage: [''],
            publicLink: [false],
            allowComments: [false]
        });
    }

    get recipeName(): string {
        return this.data?.recipe?.name || this.name || 'Recipe';
    }

    ngOnInit(): void {
        this.generateShareLink();
        this.generateEmbedCode();

        this.form.get('shareMethod')?.valueChanges.subscribe(method => {
            if (method === 'link') {
                this.generateShareLink();
            } else if (method === 'embed') {
                this.generateEmbedCode();
            }
        });
    }

    generateShareLink(): void {
        const recipeId = this.data?.recipe?.id || this.recipeId;
        this.shareLink = `${window.location.origin}/recipe/${recipeId}`;
    }

    generateEmbedCode(): void {
        const recipeId = this.data?.recipe?.id || this.recipeId;
        this.embedCode = `<iframe src="${window.location.origin}/recipe/${recipeId}/embed" width="100%" height="600" frameborder="0"></iframe>`;
    }

    copyLink(): void {
        navigator.clipboard.writeText(this.shareLink);
        // You could add a snackbar notification here
    }

    copyEmbedCode(): void {
        navigator.clipboard.writeText(this.embedCode);
        // You could add a snackbar notification here
    }

    shareToFacebook(): void {
        const url = encodeURIComponent(this.shareLink);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }

    shareToTwitter(): void {
        const url = encodeURIComponent(this.shareLink);
        const text = encodeURIComponent(`Check out this recipe: ${this.recipeName}`);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    }

    shareToPinterest(): void {
        const url = encodeURIComponent(this.shareLink);
        const description = encodeURIComponent(`Recipe: ${this.recipeName}`);
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${description}`, '_blank');
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onShare(): void {
        if (this.form.valid) {
            // Handle sharing logic here
            this.dialogRef.close(this.form.value);
        }
    }
}

