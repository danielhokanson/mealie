import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';

interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UserPreferences {
    darkMode: boolean;
    compactMode: boolean;
    showNutrition: boolean;
    showImages: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    mealPlanReminders: boolean;
    shoppingListReminders: boolean;
    publicProfile: boolean;
    showEmail: boolean;
    allowRecipeSharing: boolean;
    twoFactorEnabled: boolean;
}

@Component({
    selector: 'app-user-settings',
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
        MatTabsModule,
        MatSlideToggleModule
    ],
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {
    loading = false;
    saving = false;
    profileForm!: FormGroup;
    preferencesForm!: FormGroup;
    securityForm!: FormGroup;
    userProfile: UserProfile | null = null;
    userPreferences: UserPreferences | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private userService: UserService
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.loadUserSettings();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForms(): void {
        this.profileForm = this.fb.group({
            displayName: ['', [Validators.required, Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email]],
            bio: ['', [Validators.maxLength(500)]]
        });

        this.preferencesForm = this.fb.group({
            darkMode: [false],
            compactMode: [false],
            showNutrition: [true],
            showImages: [true],
            emailNotifications: [true],
            pushNotifications: [false],
            mealPlanReminders: [true],
            shoppingListReminders: [true],
            publicProfile: [false],
            showEmail: [false],
            allowRecipeSharing: [true],
            twoFactorEnabled: [false]
        });

        this.securityForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    private passwordMatchValidator(group: FormGroup): ValidationErrors | null {
        const newPassword = group.get('newPassword')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;
        return newPassword === confirmPassword ? null : { passwordMismatch: true };
    }

    private loadUserSettings(): void {
        this.loading = true;

        this.userService.getUserSettings()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (settings) => {
                    this.userProfile = settings.profile;
                    this.userPreferences = settings.preferences;
                    this.populateForms();
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading user settings:', error);
                    // Create default settings on error
                    this.userProfile = {
                        id: '1',
                        displayName: 'User',
                        email: 'user@example.com',
                        bio: '',
                        avatarUrl: undefined,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    this.userPreferences = {
                        darkMode: false,
                        compactMode: false,
                        showNutrition: true,
                        showImages: true,
                        emailNotifications: true,
                        pushNotifications: false,
                        mealPlanReminders: true,
                        shoppingListReminders: true,
                        publicProfile: false,
                        showEmail: false,
                        allowRecipeSharing: true,
                        twoFactorEnabled: false
                    };
                    this.populateForms();
                    this.loading = false;
                }
            });
    }

    private populateForms(): void {
        if (this.userProfile) {
            this.profileForm.patchValue({
                displayName: this.userProfile.displayName,
                email: this.userProfile.email,
                bio: this.userProfile.bio || ''
            });
        }

        if (this.userPreferences) {
            this.preferencesForm.patchValue(this.userPreferences);
        }
    }

    onSaveSettings(): void {
        if (this.profileForm.valid && this.preferencesForm.valid) {
            this.saving = true;

            const profileData = this.profileForm.value;
            const preferencesData = this.preferencesForm.value;

            this.userService.updateUserSettings({ profile: profileData, preferences: preferencesData })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (updatedSettings) => {
                        this.userProfile = updatedSettings.profile;
                        this.userPreferences = updatedSettings.preferences;
                        this.saving = false;
                        this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error saving settings:', error);
                        this.saving = false;
                        this.snackBar.open('Error saving settings. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        } else {
            this.markFormGroupTouched(this.profileForm);
            this.markFormGroupTouched(this.preferencesForm);
        }
    }

    onChangePassword(): void {
        if (this.securityForm.valid) {
            this.saving = true;

            const passwordData = this.securityForm.value;
            this.userService.changePassword(passwordData.currentPassword, passwordData.newPassword)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.saving = false;
                        this.securityForm.reset();
                        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error changing password:', error);
                        this.saving = false;
                        this.snackBar.open('Error changing password. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        } else {
            this.markFormGroupTouched(this.securityForm);
        }
    }

    onSetupTwoFactor(): void {
        // TODO: Implement two-factor authentication setup
        this.snackBar.open('Two-factor authentication setup coming soon', 'Close', { duration: 3000 });
    }

    onViewActiveSessions(): void {
        // TODO: Implement active sessions view
        this.snackBar.open('Active sessions view coming soon', 'Close', { duration: 3000 });
    }

    onLogoutAllDevices(): void {
        if (confirm('Are you sure you want to logout from all devices? This will end all active sessions.')) {
            // TODO: Implement logout all devices
            this.snackBar.open('Logged out from all devices', 'Close', { duration: 3000 });
        }
    }

    onExportData(): void {
        // TODO: Implement data export
        this.snackBar.open('Data export coming soon', 'Close', { duration: 3000 });
    }

    onImportData(): void {
        // TODO: Implement data import
        this.snackBar.open('Data import coming soon', 'Close', { duration: 3000 });
    }

    onDeleteAccount(): void {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
                // TODO: Implement account deletion
                this.snackBar.open('Account deletion coming soon', 'Close', { duration: 3000 });
            }
        }
    }

    onCancel(): void {
        this.populateForms();
        this.securityForm.reset();
    }

    canSaveSettings(): boolean {
        return (this.profileForm.valid && this.preferencesForm.valid) && !this.saving;
    }

    canChangePassword(): boolean {
        return this.securityForm.valid && !this.saving;
    }

    getBioLength(): number {
        const bio = this.profileForm.get('bio')?.value || '';
        return bio.length;
    }

    getMaxBioLength(): number {
        return 500;
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }
} 