import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-base-stat-card',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule
    ],
    templateUrl: './base-stat-card.component.html',
    styleUrls: ['./base-stat-card.component.scss']
})
export class BaseStatCardComponent {
    @Input() avatar: string = '';
    @Input() color: string = 'primary';
    @Input() icon?: string;
    @Input() image: boolean = false;
    @Input() text: string = '';
    @Input() title: string = '';

    get hasHeading(): boolean {
        return !!(this.icon || this.text);
    }

    get hasAltHeading(): boolean {
        return this.image;
    }

    get hasActions(): boolean {
        return false; // This would be determined by content projection
    }

    get hasBottom(): boolean {
        return false; // This would be determined by content projection
    }

    get hasAfterHeading(): boolean {
        return false; // This would be determined by content projection
    }

    get classes(): { [key: string]: boolean } {
        return {
            'v-card--material--has-heading': this.hasHeading,
            'mt-3': true // TODO: Add responsive check
        };
    }
} 