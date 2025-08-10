import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface PasswordStrength {
    score: number;
    strength: string;
    color: string;
}

@Component({
    selector: 'app-user-password-strength',
    standalone: true,
    imports: [CommonModule, MatProgressBarModule],
    templateUrl: './user-password-strength.component.html',
    styleUrls: ['./user-password-strength.component.scss']
})
export class UserPasswordStrengthComponent {
    @Input() password = '';

    get passwordStrength(): PasswordStrength {
        return this.calculatePasswordStrength(this.password);
    }

    private calculatePasswordStrength(password: string): PasswordStrength {
        if (!password) {
            return { score: 0, strength: 'None', color: 'warn' };
        }

        let score = 0;
        let strength = 'Weak';
        let color = 'warn';

        // Length check
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 10;

        // Character variety checks
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^A-Za-z0-9]/.test(password)) score += 15;

        // Additional checks
        if (password.length >= 16) score += 10;
        if (!/(.)\1{2,}/.test(password)) score += 10; // No repeated characters
        if (!/(.)(.)\1\2/.test(password)) score += 10; // No repeated patterns

        // Determine strength level
        if (score >= 80) {
            strength = 'Very Strong';
            color = 'primary';
        } else if (score >= 60) {
            strength = 'Strong';
            color = 'accent';
        } else if (score >= 40) {
            strength = 'Medium';
            color = 'warn';
        } else if (score >= 20) {
            strength = 'Weak';
            color = 'warn';
        } else {
            strength = 'Very Weak';
            color = 'warn';
        }

        return { score, strength, color };
    }
} 