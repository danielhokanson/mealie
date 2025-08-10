import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
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
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    forgotPasswordForm: FormGroup;
    loading = false;
    emailSent = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.forgotPasswordForm.valid) {
            this.loading = true;
            const email = this.forgotPasswordForm.get('email')?.value;

            this.authService.forgotPassword(email).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.emailSent = true;
                        this.snackBar.open('Password reset email sent! Check your inbox.', 'Close', {
                            duration: 5000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top'
                        });
                    } else {
                        this.snackBar.open(response.message || 'Failed to send reset email', 'Close', {
                            duration: 5000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top'
                        });
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Forgot password error:', error);
                    this.snackBar.open('Failed to send reset email. Please try again.', 'Close', {
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

    onBackToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.forgotPasswordForm.controls).forEach(key => {
            const control = this.forgotPasswordForm.get(key);
            control?.markAsTouched();
        });
    }

    getErrorMessage(): string {
        const emailField = this.forgotPasswordForm.get('email');
        if (emailField?.hasError('required')) {
            return 'Email is required';
        }
        if (emailField?.hasError('email')) {
            return 'Please enter a valid email address';
        }
        return '';
    }
} 