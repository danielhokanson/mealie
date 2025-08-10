import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-error-display',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './error-display.component.html',
    styleUrls: ['./error-display.component.scss']
})
export class ErrorDisplayComponent {
    @Input() title: string = 'Error';
    @Input() message: string = 'Something went wrong. Please try again.';
    @Input() showRetry: boolean = true;
    @Input() retryText: string = 'Retry';
    @Output() retry = new EventEmitter<void>();

    onRetry(): void {
        this.retry.emit();
    }
} 