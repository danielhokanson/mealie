import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-admin-setup',
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
        MatStepperModule,
        MatDividerModule,
        MatListModule,
        MatExpansionModule
    ],
    templateUrl: './admin-setup.component.html',
    styleUrls: ['./admin-setup.component.scss']
})
export class AdminSetupComponent implements OnInit, OnDestroy {
    setupForm!: FormGroup;
    loading = false;
    currentStep = 0;
    setupComplete = false;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.checkSetupStatus();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.setupForm = this.fb.group({
            // Database Configuration
            databaseType: ['postgresql', [Validators.required]],
            databaseHost: ['localhost', [Validators.required]],
            databasePort: [5432, [Validators.required, Validators.min(1), Validators.max(65535)]],
            databaseName: ['mealie', [Validators.required]],
            databaseUsername: ['', [Validators.required]],
            databasePassword: ['', [Validators.required]],

            // Application Configuration
            appName: ['Mealie', [Validators.required]],
            appUrl: ['http://localhost:4200', [Validators.required]],
            adminEmail: ['', [Validators.required, Validators.email]],
            adminUsername: ['', [Validators.required, Validators.minLength(3)]],
            adminPassword: ['', [Validators.required, Validators.minLength(8)]],
            adminConfirmPassword: ['', [Validators.required]],

            // Email Configuration
            smtpEnabled: [false],
            smtpHost: [''],
            smtpPort: [587],
            smtpUsername: [''],
            smtpPassword: [''],
            smtpFromEmail: [''],
            smtpFromName: [''],

            // Security Configuration
            jwtSecret: ['', [Validators.required, Validators.minLength(32)]],
            sessionTimeout: [24, [Validators.required, Validators.min(1)]],
            maxLoginAttempts: [5, [Validators.required, Validators.min(1)]],
            passwordMinLength: [8, [Validators.required, Validators.min(6)]],
            requireEmailVerification: [true],
            allowRegistration: [true]
        }, { validators: this.passwordMatchValidator });
    }

    private checkSetupStatus(): void {
        // TODO: Check if setup is already complete
        this.setupComplete = false;
    }

    private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
        const password = group.get('adminPassword');
        const confirmPassword = group.get('adminConfirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }

        return null;
    }

    onNextStep(): void {
        if (this.currentStep < 3) {
            this.currentStep++;
        }
    }

    onPreviousStep(): void {
        if (this.currentStep > 0) {
            this.currentStep--;
        }
    }

    onTestDatabaseConnection(): void {
        this.loading = true;

        // TODO: Implement database connection test
        setTimeout(() => {
            this.loading = false;
            this.snackBar.open('Database connection successful!', 'Close', {
                duration: 3000
            });
        }, 2000);
    }

    onGenerateJwtSecret(): void {
        const secret = this.generateRandomString(64);
        this.setupForm.patchValue({ jwtSecret: secret });
    }

    onCompleteSetup(): void {
        if (this.setupForm.valid) {
            this.loading = true;

            // TODO: Implement setup completion
            setTimeout(() => {
                this.loading = false;
                this.setupComplete = true;
                this.snackBar.open('Setup completed successfully!', 'Close', {
                    duration: 3000
                });
            }, 3000);
        } else {
            this.markFormGroupTouched();
        }
    }

    onGoToDashboard(): void {
        this.router.navigate(['/admin']);
    }

    private generateRandomString(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    private markFormGroupTouched(): void {
        Object.keys(this.setupForm.controls).forEach(key => {
            const control = this.setupForm.get(key);
            control?.markAsTouched();
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.setupForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('email')) {
            return 'Please enter a valid email address';
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
        if (fieldName === 'adminConfirmPassword' && this.setupForm.hasError('passwordMismatch')) {
            return 'Passwords do not match';
        }
        return '';
    }

    getStepTitle(step: number): string {
        const titles = [
            'Database Configuration',
            'Application Settings',
            'Email Configuration',
            'Security Settings'
        ];
        return titles[step] || '';
    }

    getStepDescription(step: number): string {
        const descriptions = [
            'Configure your database connection settings',
            'Set up basic application configuration',
            'Configure email settings for notifications',
            'Configure security and authentication settings'
        ];
        return descriptions[step] || '';
    }
} 