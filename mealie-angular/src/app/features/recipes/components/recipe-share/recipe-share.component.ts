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
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { Recipe } from '../../../../core/models/recipe.model';
import { User } from '../../../../core/models/user.model';

@Component({
    selector: 'app-recipe-share',
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
        MatTooltipModule
    ],
    templateUrl: './recipe-share.component.html',
    styleUrls: ['./recipe-share.component.scss']
})
export class RecipeShareComponent implements OnInit, OnDestroy {
    @Input() recipe: Recipe | null = null;
    @Input() dialogRef?: MatDialogRef<RecipeShareComponent>;

    loading = false;
    shareForm: FormGroup;
    shareOptions = {
        includeImage: true,
        includeNutrition: true,
        includeNotes: true,
        includeComments: false,
        includeTimeline: false
    };
    shareType: 'link' | 'email' | 'social' = 'link';
    selectedUsers: string[] = [];
    availableUsers: User[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadAvailableUsers();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.shareForm = this.fb.group({
            message: [''],
            recipients: [[]],
            shareType: ['link', [Validators.required]],
            includeImage: [true],
            includeNutrition: [true],
            includeNotes: [true],
            includeComments: [false],
            includeTimeline: [false]
        });
    }

    private loadAvailableUsers(): void {
        // TODO: Implement actual API call
        this.availableUsers = [
            { id: '1', username: 'johndoe', fullName: 'John Doe', email: 'john@example.com', role: 'user', isActive: true, createdAt: new Date() },
            { id: '2', username: 'janesmith', fullName: 'Jane Smith', email: 'jane@example.com', role: 'user', isActive: true, createdAt: new Date() },
            { id: '3', username: 'bobwilson', fullName: 'Bob Wilson', email: 'bob@example.com', role: 'user', isActive: true, createdAt: new Date() }
        ];
    }

    onShareTypeChange(type: 'link' | 'email' | 'social'): void {
        this.shareType = type;
        this.shareForm.patchValue({ shareType: type });
    }

    onToggleUser(userId: string): void {
        const index = this.selectedUsers.indexOf(userId);
        if (index > -1) {
            this.selectedUsers.splice(index, 1);
        } else {
            this.selectedUsers.push(userId);
        }
        this.shareForm.patchValue({ recipients: this.selectedUsers });
    }

    onToggleOption(option: keyof typeof this.shareOptions): void {
        this.shareOptions[option] = !this.shareOptions[option];
        this.shareForm.patchValue({ [option]: this.shareOptions[option] });
    }

    onCopyLink(): void {
        if (this.recipe) {
            const url = `${window.location.origin}/recipes/${this.recipe.id}`;
            navigator.clipboard.writeText(url).then(() => {
                this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
            }).catch(() => {
                this.snackBar.open('Failed to copy link', 'Close', { duration: 2000 });
            });
        }
    }

    onShareViaEmail(): void {
        if (this.shareForm.valid && this.recipe) {
            this.loading = true;

            const formData = this.shareForm.value;

            // TODO: Implement actual API call
            setTimeout(() => {
                this.loading = false;
                this.snackBar.open('Recipe shared via email!', 'Close', { duration: 3000 });
                this.dialogRef?.close();
            }, 1000);
        }
    }

    onShareViaSocial(platform: string): void {
        if (this.recipe) {
            const url = `${window.location.origin}/recipes/${this.recipe.id}`;
            const text = `Check out this recipe: ${this.recipe.name}`;

            let shareUrl = '';
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
                case 'pinterest':
                    shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${encodeURIComponent('Recipe: ' + this.recipe.name)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
                    break;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank');
            }
        }
    }

    onGenerateQRCode(): void {
        // TODO: Implement QR code generation
        this.snackBar.open('QR code generation coming soon', 'Close', { duration: 2000 });
    }

    onExportRecipe(): void {
        // TODO: Implement recipe export
        this.snackBar.open('Recipe export coming soon', 'Close', { duration: 2000 });
    }

    onClose(): void {
        this.dialogRef?.close();
    }

    getShareUrl(): string {
        if (this.recipe) {
            return `${window.location.origin}/recipes/${this.recipe.id}`;
        }
        return '';
    }

    getSelectedUsers(): User[] {
        return this.availableUsers.filter(user => this.selectedUsers.includes(user.id));
    }

    isUserSelected(userId: string): boolean {
        return this.selectedUsers.includes(userId);
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString();
    }
} 