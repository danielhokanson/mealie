import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { LoginRequest } from '../../../../core/models/user.model';

@Component({
    selector: 'app-login',
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
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    showPassword = false;
    rememberMe = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    ngOnInit(): void {
        // Check if user is already logged in
        if (this.authService.isAuthenticated) {
            this.router.navigate(['/recipes']);
        }
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.loading = true;
            const loginRequest: LoginRequest = {
                username: this.loginForm.get('username')?.value,
                password: this.loginForm.get('password')?.value
            };

            this.authService.login(loginRequest).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.snackBar.open('Login successful!', 'Close', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top'
                        });
                        this.router.navigate(['/recipes']);
                    } else {
                        this.snackBar.open(response.message || 'Login failed', 'Close', {
                            duration: 5000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top'
                        });
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Login error:', error);
                    this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
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

    onForgotPassword(): void {
        this.router.navigate(['/auth/forgot-password']);
    }

    onRegister(): void {
        this.router.navigate(['/auth/register']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.loginForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        return '';
    }
} 