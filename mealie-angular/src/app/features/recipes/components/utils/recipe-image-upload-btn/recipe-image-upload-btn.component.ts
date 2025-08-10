import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { AppButtonUploadComponent } from '../app-button-upload/app-button-upload.component';

@Component({
    selector: 'app-recipe-image-upload-btn',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        AppButtonUploadComponent
    ],
    templateUrl: './recipe-image-upload-btn.component.html',
    styleUrls: ['./recipe-image-upload-btn.component.scss']
})
export class RecipeImageUploadBtnComponent {
    @Input() slug = '';

    @Output() refresh = new EventEmitter<void>();
    @Output() upload = new EventEmitter<File>();

    url = '';
    loading = false;
    menuOpen = false;

    get messages(): string[] {
        return this.slug ? [''] : ['Save recipe before use'];
    }

    get isDisabled(): boolean {
        return !this.slug;
    }

    uploadImage(fileObject: File): void {
        this.upload.emit(fileObject);
        this.menuOpen = false;
    }

    async getImageFromURL(): Promise<void> {
        this.loading = true;

        try {
            // In a real app, you'd call the backend API
            // await this.recipeService.updateImageByURL(this.slug, this.url);
            console.log('Updating image from URL:', this.url);
            this.refresh.emit();
        } catch (error) {
            console.error('Failed to update image from URL:', error);
        } finally {
            this.loading = false;
            this.menuOpen = false;
        }
    }

    onUrlChange(event: any): void {
        this.url = event.target.value;
    }
} 