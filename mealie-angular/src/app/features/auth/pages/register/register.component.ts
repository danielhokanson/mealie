import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/user.model';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatCheckboxModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    showPassword = false;
    showConfirmPassword = false;
    acceptTerms = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],
            acceptTerms: [false, [Validators.requiredTrue]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        // Check if user is already logged in
        if (this.authService.isAuthenticated) {
            this.router.navigate(['/recipes']);
        }
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            this.loading = true;
            const registerRequest: RegisterRequest = {
                username: this.registerForm.get('username')?.value,
                fullName: this.registerForm.get('fullName')?.value,
                email: this.registerForm.get('email')?.value,
                password: this.registerForm.get('password')?.value,
                confirmPassword: this.registerForm.get('confirmPassword')?.value
            };

            this.authService.register(registerRequest).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.snackBar.open('Registration successful! Welcome to Mealie!', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top'
                        });
                        this.router.navigate(['/recipes']);
                    } else {
                        this.snackBar.open(response.message || 'Registration failed', 'Close', {
                            duration: 5000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top'
                        });
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Registration error:', error);
                    this.snackBar.open('Registration failed. Please try again.', 'Close', {
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

    onLogin(): void {
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
        Object.keys(this.registerForm.controls).forEach(key => {
            const control = this.registerForm.get(key);
            control?.markAsTouched();
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.registerForm.get(fieldName);

        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        if (field?.hasError('maxlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${field?.errors?.['maxlength'].requiredLength} characters`;
        }
        if (field?.hasError('email')) {
            return 'Please enter a valid email address';
        }
        if (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
            return 'Passwords do not match';
        }

        return '';
    }

    getPasswordStrength(): string {
        const password = this.registerForm.get('password')?.value;
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