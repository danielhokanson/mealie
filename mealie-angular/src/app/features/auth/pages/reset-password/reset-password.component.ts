import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    resetPasswordForm: FormGroup;
    loading = false;
    showPassword = false;
    showConfirmPassword = false;
    token: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        this.resetPasswordForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        // Get token from query parameters
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            if (!this.token) {
                this.snackBar.open('Invalid reset link. Please request a new password reset.', 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top'
                });
                this.router.navigate(['/auth/login']);
            }
        });
    }

    onSubmit(): void {
        if (this.resetPasswordForm.valid && this.token) {
            this.loading = true;
            const newPassword = this.resetPasswordForm.get('password')?.value;

            this.authService.resetPassword(this.token, newPassword).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.snackBar.open('Password reset successful! You can now log in with your new password.', 'Close', {
                            duration: 5000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top'
                        });
                        this.router.navigate(['/auth/login']);
                    } else {
                        this.snackBar.open(response.message || 'Password reset failed', 'Close', {
                            duration: 5000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top'
                        });
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Reset password error:', error);
                    this.snackBar.open('Password reset failed. Please try again.', 'Close', {
                        duration: 5000,
                        horizontalPosition: 'center',
                        verticalPosition: 'top'
                    });
                    this.loading = false;
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onBackToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }

        return null;
    }

    private markFormGroupTouched(): void {
        Object.keys(this.resetPasswordForm.controls).forEach(key => {
            const control = this.resetPasswordForm.get(key);
            control?.markAsTouched();
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.resetPasswordForm.get(fieldName);

        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        if (fieldName === 'confirmPassword' && this.resetPasswordForm.hasError('passwordMismatch')) {
            return 'Passwords do not match';
        }

        return '';
    }

    getPasswordStrength(): string {
        const password = this.resetPasswordForm.get('password')?.value;
        if (!password) return '';

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                return 'weak';
            case 2:
            case 3:
                return 'medium';
            case 4:
            case 5:
                return 'strong';
            default:
                return '';
        }
    }

    getPasswordStrengthColor(): string {
        const strength = this.getPasswordStrength();
        switch (strength) {
            case 'weak':
                return '#f44336';
            case 'medium':
                return '#ff9800';
            case 'strong':
                return '#4caf50';
            default:
                return '#ccc';
        }
    }
} 