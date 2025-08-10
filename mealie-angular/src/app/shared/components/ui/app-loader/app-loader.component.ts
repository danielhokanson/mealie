import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

interface LoaderSize {
    width: number;
    icon: number;
    size: number;
}

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
    templateUrl: './app-loader.component.html',
    styleUrls: ['./app-loader.component.scss']
})
export class AppLoaderComponent {
    @Input() loading = true;
    @Input() tiny = false;
    @Input() small = false;
    @Input() medium = true;
    @Input() large = false;
    @Input() waitingText?: string;

    size = computed((): LoaderSize => {
        if (this.tiny) {
            return {
                width: 2,
                icon: 0,
                size: 25,
            };
        }
        if (this.small) {
            return {
                width: 2,
                icon: 30,
                size: 50,
            };
        }
        if (this.large) {
            return {
                width: 4,
                icon: 120,
                size: 200,
            };
        }
        return {
            width: 3,
            icon: 75,
            size: 125,
        };
    });

    get waitingTextCalculated(): string {
        return this.waitingText ?? 'Loading recipes...';
    }

    get primaryIcon(): string {
        return 'restaurant'; // Default icon, can be customized
    }
} 