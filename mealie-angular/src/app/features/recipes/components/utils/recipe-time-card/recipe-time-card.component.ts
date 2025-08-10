import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface TimeInfo {
    name: string;
    value: string;
}

@Component({
    selector: 'app-recipe-time-card',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatDividerModule],
    templateUrl: './recipe-time-card.component.html',
    styleUrls: ['./recipe-time-card.component.scss']
})
export class RecipeTimeCardComponent {
    @Input() prepTime?: number | null;
    @Input() totalTime?: number | null;
    @Input() performTime?: number | null;
    @Input() color = 'accent';
    @Input() small = false;

    get showCards(): boolean {
        return [this.prepTime, this.totalTime, this.performTime].some(time => time != null && time > 0);
    }

    get totalTimeInfo(): TimeInfo | null {
        if (!this.totalTime || this.totalTime <= 0) return null;
        return {
            name: 'Total Time',
            value: this.formatTime(this.totalTime)
        };
    }

    get prepTimeInfo(): TimeInfo | null {
        if (!this.prepTime || this.prepTime <= 0) return null;
        return {
            name: 'Prep Time',
            value: this.formatTime(this.prepTime)
        };
    }

    get performTimeInfo(): TimeInfo | null {
        if (!this.performTime || this.performTime <= 0) return null;
        return {
            name: 'Cook Time',
            value: this.formatTime(this.performTime)
        };
    }

    private formatTime(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return `${hours} hr`;
        }

        return `${hours} hr ${remainingMinutes} min`;
    }
} 