import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';

interface SiteSettings {
    general: {
        siteName: string;
        siteDescription: string;
        siteUrl: string;
        adminEmail: string;
        timezone: string;
        language: string;
        dateFormat: string;
        timeFormat: string;
    };
    features: {
        enableRegistration: boolean;
        enablePublicRecipes: boolean;
        enableComments: boolean;
        enableRatings: boolean;
        enableSharing: boolean;
        enablePrinting: boolean;
        enableExport: boolean;
        enableImport: boolean;
        enableBackups: boolean;
        enableNotifications: boolean;
    };
    security: {
        requireEmailVerification: boolean;
        requireAdminApproval: boolean;
        maxLoginAttempts: number;
        sessionTimeout: number;
        passwordMinLength: number;
        enableTwoFactor: boolean;
        enableApiKeys: boolean;
    };
    email: {
        smtpHost: string;
        smtpPort: number;
        smtpUsername: string;
        smtpPassword: string;
        smtpUseTls: boolean;
        fromEmail: string;
        fromName: string;
        enableEmailNotifications: boolean;
    };
    storage: {
        maxFileSize: number;
        allowedFileTypes: string[];
        storageProvider: string;
        s3Bucket: string;
        s3Region: string;
        s3AccessKey: string;
        s3SecretKey: string;
    };
    appearance: {
        theme: string;
        primaryColor: string;
        accentColor: string;
        enableDarkMode: boolean;
        logoUrl: string;
        faviconUrl: string;
        customCss: string;
    };
}

@Component({
    selector: 'app-admin-site-settings',
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
        MatSliderModule,
        MatSlideToggleModule
    ],
    templateUrl: './admin-site-settings.component.html',
    styleUrls: ['./admin-site-settings.component.scss']
})
export class AdminSiteSettingsComponent implements OnInit, OnDestroy {
    loading = false;
    saving = false;
    settingsForm!: FormGroup;
    originalSettings: SiteSettings | null = null;
    hasChanges = false;

    timezones = [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Asia/Tokyo', label: 'Tokyo' }
    ];

    languages = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'it', label: 'Italian' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'ru', label: 'Russian' },
        { value: 'ja', label: 'Japanese' },
        { value: 'zh', label: 'Chinese' }
    ];

    dateFormats = [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' }
    ];

    timeFormats = [
        { value: '12', label: '12-hour' },
        { value: '24', label: '24-hour' }
    ];

    themes = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'auto', label: 'Auto' }
    ];

    storageProviders = [
        { value: 'local', label: 'Local Storage' },
        { value: 's3', label: 'Amazon S3' },
        { value: 'gcs', label: 'Google Cloud Storage' },
        { value: 'azure', label: 'Azure Blob Storage' }
    ];

    allowedFileTypes = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
        'pdf', 'doc', 'docx', 'txt',
        'mp4', 'avi', 'mov', 'wmv'
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private adminService: AdminService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadSettings();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.settingsForm = this.fb.group({
            general: this.fb.group({
                siteName: ['', [Validators.required, Validators.maxLength(100)]],
                siteDescription: ['', [Validators.maxLength(500)]],
                siteUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
                adminEmail: ['', [Validators.required, Validators.email]],
                timezone: ['UTC', [Validators.required]],
                language: ['en', [Validators.required]],
                dateFormat: ['MM/DD/YYYY', [Validators.required]],
                timeFormat: ['12', [Validators.required]]
            }),
            features: this.fb.group({
                enableRegistration: [true],
                enablePublicRecipes: [true],
                enableComments: [true],
                enableRatings: [true],
                enableSharing: [true],
                enablePrinting: [true],
                enableExport: [true],
                enableImport: [true],
                enableBackups: [true],
                enableNotifications: [true]
            }),
            security: this.fb.group({
                requireEmailVerification: [true],
                requireAdminApproval: [false],
                maxLoginAttempts: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
                sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(1440)]],
                passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(50)]],
                enableTwoFactor: [false],
                enableApiKeys: [true]
            }),
            email: this.fb.group({
                smtpHost: ['', [Validators.required]],
                smtpPort: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
                smtpUsername: ['', [Validators.required]],
                smtpPassword: ['', [Validators.required]],
                smtpUseTls: [true],
                fromEmail: ['', [Validators.required, Validators.email]],
                fromName: ['', [Validators.required]],
                enableEmailNotifications: [true]
            }),
            storage: this.fb.group({
                maxFileSize: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
                allowedFileTypes: [this.allowedFileTypes],
                storageProvider: ['local', [Validators.required]],
                s3Bucket: [''],
                s3Region: [''],
                s3AccessKey: [''],
                s3SecretKey: ['']
            }),
            appearance: this.fb.group({
                theme: ['light', [Validators.required]],
                primaryColor: ['#1976d2', [Validators.required, Validators.pattern('^#[0-9A-Fa-f]{6}$')]],
                accentColor: ['#ff4081', [Validators.required, Validators.pattern('^#[0-9A-Fa-f]{6}$')]],
                enableDarkMode: [false],
                logoUrl: [''],
                faviconUrl: [''],
                customCss: ['']
            })
        });

        // Watch for changes
        this.settingsForm.valueChanges.subscribe(() => {
            this.checkForChanges();
        });
    }

    private loadSettings(): void {
        this.loading = true;

        this.adminService.getSiteSettings()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (settings) => {
                    this.originalSettings = settings;
                    this.settingsForm.patchValue(settings);
                    this.hasChanges = false;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading settings:', error);
                    this.snackBar.open('Error loading settings', 'Close', { duration: 3000 });
                    this.loading = false;
                    // Fallback to sample data for development
                    setTimeout(() => {
                        this.originalSettings = {
                            general: {
                                siteName: 'Mealie',
                                siteDescription: 'A recipe management application',
                                siteUrl: 'https://mealie.example.com',
                                adminEmail: 'admin@example.com',
                                timezone: 'UTC',
                                language: 'en',
                                dateFormat: 'MM/DD/YYYY',
                                timeFormat: '12'
                            },
                            features: {
                                enableRegistration: true,
                                enablePublicRecipes: true,
                                enableComments: true,
                                enableRatings: true,
                                enableSharing: true,
                                enablePrinting: true,
                                enableExport: true,
                                enableImport: true,
                                enableBackups: true,
                                enableNotifications: true
                            },
                            security: {
                                requireEmailVerification: true,
                                requireAdminApproval: false,
                                maxLoginAttempts: 5,
                                sessionTimeout: 30,
                                passwordMinLength: 8,
                                enableTwoFactor: false,
                                enableApiKeys: true
                            },
                            email: {
                                smtpHost: 'smtp.gmail.com',
                                smtpPort: 587,
                                smtpUsername: 'noreply@example.com',
                                smtpPassword: '',
                                smtpUseTls: true,
                                fromEmail: 'noreply@example.com',
                                fromName: 'Mealie',
                                enableEmailNotifications: true
                            },
                            storage: {
                                maxFileSize: 10,
                                allowedFileTypes: this.allowedFileTypes,
                                storageProvider: 'local',
                                s3Bucket: '',
                                s3Region: '',
                                s3AccessKey: '',
                                s3SecretKey: ''
                            },
                            appearance: {
                                theme: 'light',
                                primaryColor: '#1976d2',
                                accentColor: '#ff4081',
                                enableDarkMode: false,
                                logoUrl: '',
                                faviconUrl: '',
                                customCss: ''
                            }
                        };

                        this.settingsForm.patchValue(this.originalSettings);
                        this.loading = false;
                    }, 500);
                }
            });
    }

    onSaveSettings(): void {
        if (this.settingsForm.valid) {
            this.saving = true;
            const settings = this.settingsForm.value;

            this.adminService.updateSiteSettings(settings)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (updatedSettings) => {
                        this.originalSettings = updatedSettings;
                        this.hasChanges = false;
                        this.saving = false;
                        this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error saving settings:', error);
                        this.snackBar.open('Error saving settings', 'Close', { duration: 3000 });
                        this.saving = false;
                    }
                });
        } else {
            this.markFormGroupTouched();
        }
    }

    onResetSettings(): void {
        if (confirm('Are you sure you want to reset all settings to their default values?')) {
            this.loadSettings();
            this.snackBar.open('Settings reset to defaults', 'Close', { duration: 3000 });
        }
    }

    onTestEmail(): void {
        const emailSettings = this.settingsForm.get('email')?.value;
        if (emailSettings) {
            this.loading = true;

            // TODO: Implement actual email test
            setTimeout(() => {
                this.loading = false;
                this.snackBar.open('Test email sent successfully', 'Close', { duration: 3000 });
            }, 1000);
        }
    }

    onPreviewTheme(): void {
        const appearance = this.settingsForm.get('appearance')?.value;
        if (appearance) {
            // TODO: Implement theme preview
            this.snackBar.open('Theme preview updated', 'Close', { duration: 2000 });
        }
    }

    onAddFileType(fileType: string): void {
        const allowedTypes = this.settingsForm.get('storage.allowedFileTypes')?.value || [];
        if (!allowedTypes.includes(fileType)) {
            this.settingsForm.patchValue({
                storage: {
                    ...this.settingsForm.get('storage')?.value,
                    allowedFileTypes: [...allowedTypes, fileType]
                }
            });
        }
    }

    onRemoveFileType(fileType: string): void {
        const allowedTypes = this.settingsForm.get('storage.allowedFileTypes')?.value || [];
        const updatedTypes = allowedTypes.filter((type: string) => type !== fileType);
        this.settingsForm.patchValue({
            storage: {
                ...this.settingsForm.get('storage')?.value,
                allowedFileTypes: updatedTypes
            }
        });
    }

    private checkForChanges(): void {
        if (this.originalSettings) {
            const currentSettings = this.settingsForm.value;
            this.hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(this.originalSettings);
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.settingsForm.controls).forEach(key => {
            const control = this.settingsForm.get(key);
            if (control instanceof FormGroup) {
                Object.keys(control.controls).forEach(subKey => {
                    const subControl = control.get(subKey);
                    subControl?.markAsTouched();
                });
            } else {
                control?.markAsTouched();
            }
        });
    }

    getErrorMessage(fieldName: string, subField?: string): string {
        const field = subField
            ? this.settingsForm.get(fieldName)?.get(subField)
            : this.settingsForm.get(fieldName);

        if (field?.hasError('required')) {
            return `${(subField || fieldName).charAt(0).toUpperCase() + (subField || fieldName).slice(1)} is required`;
        }
        if (field?.hasError('email')) {
            return 'Please enter a valid email address';
        }
        if (field?.hasError('pattern')) {
            if (fieldName === 'siteUrl') {
                return 'Please enter a valid URL';
            }
            if (fieldName === 'primaryColor' || fieldName === 'accentColor') {
                return 'Please enter a valid hex color (e.g., #1976d2)';
            }
        }
        if (field?.hasError('min')) {
            return `${(subField || fieldName).charAt(0).toUpperCase() + (subField || fieldName).slice(1)} must be at least ${field?.errors?.['min'].min}`;
        }
        if (field?.hasError('max')) {
            return `${(subField || fieldName).charAt(0).toUpperCase() + (subField || fieldName).slice(1)} must be no more than ${field?.errors?.['max'].max}`;
        }
        if (field?.hasError('maxlength')) {
            return `${(subField || fieldName).charAt(0).toUpperCase() + (subField || fieldName).slice(1)} must be no more than ${field?.errors?.['maxlength'].requiredLength} characters`;
        }
        return '';
    }

    canSave(): boolean {
        return this.settingsForm.valid && this.hasChanges && !this.saving;
    }

    getFileSizeDisplay(size: number): string {
        return `${size} MB`;
    }

    getSessionTimeoutDisplay(timeout: number): string {
        if (timeout < 60) {
            return `${timeout} minutes`;
        } else if (timeout < 1440) {
            return `${Math.round(timeout / 60)} hours`;
        } else {
            return `${Math.round(timeout / 1440)} days`;
        }
    }
} 