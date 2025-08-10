import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-stats-cards',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './stats-cards.component.html',
    styleUrls: ['./stats-cards.component.scss']
})
export class StatsCardsComponent {
    @Input() icon?: string | null;
    @Input() minWidth: string = '';
    @Input() to?: string | null;

    constructor(private router: Router) { }

    get activeIcon(): string {
        return this.icon || 'star';
    }

    navigateTo(): void {
        if (this.to) {
            this.router.navigate([this.to]);
        }
    }

    get isClickable(): boolean {
        return !!this.to;
    }
} 