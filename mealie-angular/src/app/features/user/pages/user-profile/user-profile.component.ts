import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { User, UserProfile, UserPreferences } from '../../../../core/models/user.model';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatDividerModule,
        MatListModule,
        MatExpansionModule,
        MatChipsModule,
        MatMenuModule,
        MatTooltipModule
    ],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
    loading = true;
    saving = false;
    error = false;
    selectedTab = 0;
    currentUser: User | null = null;
    userProfile: UserProfile | null = null;
    userPreferences: UserPreferences | null = null;

    // Forms
    profileForm!: FormGroup;
    preferencesForm!: FormGroup;
    passwordForm!: FormGroup;

    // Profile image
    selectedImage: File | null = null;
    imagePreview: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private fb: FormBuilder
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.loadUserData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForms(): void {
        this.profileForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            fullName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            bio: ['']
        });

        this.preferencesForm = this.fb.group({
            theme: ['light', [Validators.required]],
            language: ['en', [Validators.required]],
            timezone: ['UTC', [Validators.required]],
            units: ['metric', [Validators.required]]
        });

        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    public loadUserData(): void {
        this.loading = true;
        this.error = false;

        // Get current user
        this.currentUser = this.authService.currentUser;

        if (this.currentUser) {
            // Load user profile
            this.loadUserProfile();

            // Load user preferences
            this.loadUserPreferences();

            // Populate forms
            this.populateForms();
        }

        this.loading = false;
    }

    private loadUserProfile(): void {
        this.userService.getCurrentUserProfile()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (profile) => {
                    this.userProfile = profile;
                    this.populateForms();
                },
                error: (error) => {
                    console.error('Error loading user profile:', error);
                    // Create default profile on error
                    //TODO: Explain why we are doing this in the on error 
                    this.userProfile = {
                        id: this.currentUser!.id,
                        username: this.currentUser!.username,
                        fullName: this.currentUser!.fullName,
                        email: this.currentUser!.email,
                        bio: '',
                        avatar: this.currentUser!.avatar,
                        group: { id: '', name: '', slug: '', description: '', isPrivate: false, createdAt: new Date(), updatedAt: new Date(), users: [], households: [] },
                        household: undefined,
                        preferences: {
                            id: '',
                            userId: this.currentUser!.id,
                            theme: 'light',
                            language: 'en',
                            timezone: 'UTC',
                            units: 'metric',
                            dietaryRestrictions: [],
                            emailNotifications: true,
                            allergies: [],
                            cuisinePreferences: [],
                            cookingSkill: 'beginner',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    };
                    this.populateForms();
                }
            });
    }

    private loadUserPreferences(): void {
        this.userService.getUserPreferences()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (preferences) => {
                    this.userPreferences = preferences;
                    this.populateForms();
                },
                error: (error) => {
                    console.error('Error loading user preferences:', error);
                    // Create default preferences on error
                    this.userPreferences = {
                        id: '',
                        userId: this.currentUser!.id,
                        theme: 'light',
                        language: 'en',
                        timezone: 'UTC',
                        units: 'metric',
                        dietaryRestrictions: [],
                        emailNotifications: true,
                        allergies: [],
                        cuisinePreferences: [],
                        cookingSkill: 'beginner',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    this.populateForms();
                }
            });
    }

    private populateForms(): void {
        if (this.currentUser) {
            this.profileForm.patchValue({
                username: this.currentUser.username,
                fullName: this.currentUser.fullName,
                email: this.currentUser.email,
                bio: this.userProfile?.bio || ''
            });
        }

        if (this.userPreferences) {
            this.preferencesForm.patchValue(this.userPreferences);
        }
    }

    private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
        const newPassword = group.get('newPassword');
        const confirmPassword = group.get('confirmPassword');

        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }

        return null;
    }

    onImageSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedImage = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    onSaveProfile(): void {
        if (this.profileForm.valid) {
            this.saving = true;
            const profileData = this.profileForm.value;

            this.userService.updateUserProfile(profileData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (updatedProfile) => {
                        this.userProfile = updatedProfile;
                        this.saving = false;
                        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error updating profile:', error);
                        this.saving = false;
                        this.snackBar.open('Error updating profile. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        }
    }

    onSavePreferences(): void {
        if (this.preferencesForm.valid) {
            this.saving = true;
            const preferencesData = this.preferencesForm.value;

            this.userService.updateUserPreferences(preferencesData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (updatedPreferences) => {
                        this.userPreferences = updatedPreferences;
                        this.saving = false;
                        this.snackBar.open('Preferences updated successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error updating preferences:', error);
                        this.saving = false;
                        this.snackBar.open('Error updating preferences. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        }
    }

    onChangePassword(): void {
        if (this.passwordForm.valid) {
            this.saving = true;

            const passwordData = this.passwordForm.value;

            this.authService.changePassword(passwordData.currentPassword, passwordData.newPassword).subscribe({
                next: (response) => {
                    this.saving = false;
                    this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
                    this.passwordForm.reset();
                },
                error: (error) => {
                    this.saving = false;
                    this.snackBar.open('Failed to change password. Please try again.', 'Close', { duration: 5000 });
                }
            });
        }
    }

    onDeleteAccount(): void {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // TODO: Implement account deletion
            this.snackBar.open('Account deletion coming soon', 'Close', { duration: 3000 });
        }
    }

    onExportData(): void {
        // TODO: Implement data export
        this.snackBar.open('Data export coming soon', 'Close', { duration: 3000 });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.profileForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('email')) {
            return 'Please enter a valid email address';
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        return '';
    }

    getPasswordErrorMessage(fieldName: string): string {
        const field = this.passwordForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        if (fieldName === 'confirmPassword' && this.passwordForm.hasError('passwordMismatch')) {
            return 'Passwords do not match';
        }
        return '';
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString();
    }

    getCookingSkillColor(skill: string): string {
        switch (skill) {
            case 'beginner':
                return '#4caf50';
            case 'intermediate':
                return '#ff9800';
            case 'advanced':
                return '#f44336';
            default:
                return '#666';
        }
    }
} 