import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

export interface MultiPurposeLabelSummary {
    id: string;
    name: string;
    color?: string;
}

@Component({
    selector: 'app-multi-purpose-label',
    standalone: true,
    imports: [CommonModule, MatChipsModule],
    templateUrl: './multi-purpose-label.component.html',
    styleUrls: ['./multi-purpose-label.component.scss']
})
export class MultiPurposeLabelComponent {
    @Input() label!: MultiPurposeLabelSummary;
    @Input() size: 'small' | 'medium' | 'large' = 'medium';

    getTextColor(backgroundColor: string): string {
        // Simple text color calculation based on background color
        // In a real app, you'd use a more sophisticated color contrast algorithm
        if (!backgroundColor) return '#000000';

        // Convert hex to RGB and calculate luminance
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
} 