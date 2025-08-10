import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CreateUserRegistration } from '../../models/user';

@Component({
    selector: 'app-registry',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        FormsModule
    ],
    templateUrl: './registry.component.html',
    styleUrls: ['./registry.component.scss']
})
export class RegistryComponent {
    // Account Details
    username = '';
    email = '';
    fullName = '';

    // Credentials
    password = '';
    passwordConfirm = '';

    // Group Details
    createGroup = true;
    groupName = '';
    groupPrivate = false;
    groupToken = '';
    seedData = true;

    // Options
    advanced = false;
    locale = 'en-US'; // Default locale

    isLoading = false;
    errorMessage = '';

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    onRegister(): void {
        if (!this.username || !this.email || !this.password || !this.passwordConfirm || !this.fullName) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        if (this.password !== this.passwordConfirm) {
            this.errorMessage = 'Passwords do not match';
            return;
        }

        if (this.createGroup && !this.groupName) {
            this.errorMessage = 'Please enter a group name';
            return;
        }

        if (!this.createGroup && !this.groupToken) {
            this.errorMessage = 'Please enter a group token';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const registrationData: CreateUserRegistration = {
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            password: this.password,
            confirmPassword: this.passwordConfirm,
            advancedOptions: this.advanced
        };

        this.authService.register(registrationData).subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (error) => {
                if (error.status === 409) {
                    // Handle specific conflict errors
                    this.errorMessage = error.error?.detail?.message || 'Username or email already exists';
                } else if (error.status === 400) {
                    this.errorMessage = error.error?.detail?.message || 'Invalid registration data';
                } else {
                    this.errorMessage = 'Registration failed. Please try again.';
                }
                this.isLoading = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/']);
    }

    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }
}