import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { BaseButtonComponent } from '../base-button/base-button.component';

export interface RecipeShareToken {
    id: string;
    recipeId: string;
    expiresAt: string;
    token: string;
    createdAt: string;
}

@Component({
    selector: 'app-recipe-dialog-share',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMenuModule,
        MatListModule,
        MatDividerModule,
        FormsModule,
        BaseDialogComponent,
        BaseButtonComponent
    ],
    templateUrl: './recipe-dialog-share.component.html',
    styleUrls: ['./recipe-dialog-share.component.scss']
})
export class RecipeDialogShareComponent implements OnInit, OnDestroy {
    @Input() recipeId = '';
    @Input() name = '';
    @Input() open = false;

    @Output() openChange = new EventEmitter<boolean>();

    dialog = false;
    datePickerMenu = false;
    expirationDate = new Date();
    tokens: RecipeShareToken[] = [];

    // Mock user data - in a real app, this would come from auth service
    currentUser = {
        groupSlug: 'default-group'
    };

    // Mock household data - in a real app, this would come from household service
    household = {
        preferences: {
            firstDayOfWeek: 0
        }
    };

    get expirationDateString(): string {
        return this.expirationDate.toISOString().substring(0, 10);
    }

    get firstDayOfWeek(): number {
        return this.household.preferences?.firstDayOfWeek || 0;
    }

    ngOnInit(): void {
        this.initializeDialog();
    }

    ngOnDestroy(): void {
        // Cleanup if needed
    }

    private initializeDialog(): void {
        // Set expiration date to today + 30 days
        const today = new Date();
        this.expirationDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        this.refreshTokens();
    }

    onDialogChange(open: boolean): void {
        this.open = open;
        this.openChange.emit(open);
        if (open) {
            this.initializeDialog();
        }
    }

    async createNewToken(): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // const response = await this.recipeService.createShareToken({
            //   recipeId: this.recipeId,
            //   expiresAt: this.expirationDate.toISOString()
            // });

            // Mock response
            const newToken: RecipeShareToken = {
                id: Date.now().toString(),
                recipeId: this.recipeId,
                expiresAt: this.expirationDate.toISOString(),
                token: 'mock-token-' + Date.now(),
                createdAt: new Date().toISOString()
            };

            this.tokens.push(newToken);
            console.log('Created new share token:', newToken);
        } catch (error) {
            console.error('Failed to create share token:', error);
        }
    }

    async deleteToken(id: string): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // await this.recipeService.deleteShareToken(id);

            this.tokens = this.tokens.filter(token => token.id !== id);
            console.log('Deleted share token:', id);
        } catch (error) {
            console.error('Failed to delete share token:', error);
        }
    }

    async refreshTokens(): Promise<void> {
        try {
            // TODO: Implement API call to get share tokens
            // const response = await this.recipeService.getShareTokens(this.recipeId);
            // this.tokens = response.data;
            
            // Initialize with empty array for production
            this.tokens = [];
        } catch (error) {
            console.error('Failed to refresh tokens:', error);
            this.tokens = [];
        }
    }

    getTokenLink(token: string): string {
        return `${window.location.origin}/g/${this.currentUser.groupSlug}/shared/r/${token}`;
    }

    async copyTokenLink(token: string): Promise<void> {
        try {
            const link = this.getTokenLink(token);
            await navigator.clipboard.writeText(link);
            console.log('Recipe link copied to clipboard');
            // In a real app, you'd show a success toast
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // In a real app, you'd show an error toast
        }
    }

    async shareRecipe(token: string): Promise<void> {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: this.name,
                    url: this.getTokenLink(token),
                    text: `Check out this recipe: ${this.name}`
                });
            } else {
                await this.copyTokenLink(token);
            }
        } catch (error) {
            console.error('Failed to share recipe:', error);
        }
    }

    onDateChange(): void {
        this.datePickerMenu = false;
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
} 