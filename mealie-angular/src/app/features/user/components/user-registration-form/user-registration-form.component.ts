import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

import { UserPasswordStrengthComponent } from '../user-password-strength/user-password-strength.component';

export interface RegistrationData {
    username: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    advancedOptions: boolean;
}

@Component({
    selector: 'app-user-registration-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatDividerModule,
        UserPasswordStrengthComponent
    ],
    templateUrl: './user-registration-form.component.html',
    styleUrls: ['./user-registration-form.component.scss']
})
export class UserRegistrationFormComponent implements OnInit {
    @Output() formSubmit = new EventEmitter<RegistrationData>();
    @Output() formValid = new EventEmitter<boolean>();

    registrationForm!: FormGroup;
    showPassword = false;
    showConfirmPassword = false;
    usernameError = '';
    emailError = '';

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.initForm();
        this.setupFormValidation();
    }

    private initForm(): void {
        this.registrationForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
            confirmPassword: ['', [Validators.required]],
            advancedOptions: [false]
        }, { validators: this.passwordMatchValidator });
    }

    private setupFormValidation(): void {
        this.registrationForm.valueChanges.subscribe(() => {
            this.formValid.emit(this.registrationForm.valid);
        });
    }

    private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }

        return null;
    }

    onUsernameBlur(): void {
        this.validateUsername();
    }

    onEmailBlur(): void {
        this.validateEmail();
    }

    private validateUsername(): void {
        const username = this.registrationForm.get('username');
        if (username?.value) {
            // In a real app, you'd call the backend to check username availability
            // For now, we'll just clear any previous errors
            this.usernameError = '';
        }
    }

    private validateEmail(): void {
        const email = this.registrationForm.get('email');
        if (email?.value) {
            // In a real app, you'd call the backend to check email availability
            // For now, we'll just clear any previous errors
            this.emailError = '';
        }
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit(): void {
        if (this.registrationForm.valid) {
            const formData: RegistrationData = this.registrationForm.value;
            this.formSubmit.emit(formData);
        }
    }

    getPasswordInputType(): string {
        return this.showPassword ? 'text' : 'password';
    }

    getConfirmPasswordInputType(): string {
        return this.showConfirmPassword ? 'text' : 'password';
    }

    getPasswordIcon(): string {
        return this.showPassword ? 'visibility_off' : 'visibility';
    }

    getConfirmPasswordIcon(): string {
        return this.showConfirmPassword ? 'visibility_off' : 'visibility';
    }

    getFormErrors(fieldName: string): string[] {
        const field = this.registrationForm.get(fieldName);
        if (!field || !field.errors || !field.touched) return [];

        const errors: string[] = [];

        if (field.errors['required']) {
            errors.push('This field is required');
        }

        if (field.errors['email']) {
            errors.push('Please enter a valid email address');
        }

        if (field.errors['minlength']) {
            const requiredLength = field.errors['minlength'].requiredLength;
            errors.push(`Minimum length is ${requiredLength} characters`);
        }

        if (field.errors['maxlength']) {
            const requiredLength = field.errors['maxlength'].requiredLength;
            errors.push(`Maximum length is ${requiredLength} characters`);
        }

        return errors;
    }

    getPasswordMatchError(): string {
        if (this.registrationForm.errors?.['passwordMismatch'] &&
            this.registrationForm.get('confirmPassword')?.touched) {
            return 'Passwords do not match';
        }
        return '';
    }
} 