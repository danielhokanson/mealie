import { Component, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { BaseButtonComponent } from '../base-button/base-button.component';

export interface DialogProps {
    modelValue: boolean;
    color?: string;
    title?: string;
    icon?: string | null;
    width?: number | string;
    maxWidth?: number | string | null;
    loading?: boolean;
    top?: boolean | null;
    submitIcon?: string | null;
    submitText?: string;
    submitDisabled?: boolean;
    keepOpen?: boolean;
    canDelete?: boolean;
    canConfirm?: boolean;
    canSubmit?: boolean;
}

@Component({
    selector: 'app-base-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatCardModule,
        MatProgressBarModule,
        MatDividerModule,
        BaseButtonComponent
    ],
    templateUrl: './base-dialog.component.html',
    styleUrls: ['./base-dialog.component.scss']
})
export class BaseDialogComponent {
    @Input() modelValue = false;
    @Input() color = 'primary';
    @Input() title = 'Modal Title';
    @Input() icon: string | null = null;
    @Input() width: number | string = 500;
    @Input() maxWidth: number | string | null = null;
    @Input() loading = false;
    @Input() top: boolean | null = null;
    @Input() submitIcon: string | null = null;
    @Input() submitText = 'Create';
    @Input() submitDisabled = false;
    @Input() keepOpen = false;
    @Input() canDelete = false;
    @Input() canConfirm = false;
    @Input() canSubmit = false;

    @Output() modelValueChange = new EventEmitter<boolean>();
    @Output() submit = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    dialog = signal(false);
    submitted = signal(false);

    constructor() {
        // Watch for modelValue changes
        effect(() => {
            this.dialog.set(this.modelValue);
        });

        // Watch for dialog changes
        effect(() => {
            if (this.dialog()) {
                this.submitted.set(false);
            } else {
                this.close.emit();
            }
        });

        // Watch for submission completion
        effect(() => {
            const shouldClose = this.submitted() && !this.loading && !this.keepOpen;
            if (shouldClose) {
                this.submitted.set(false);
                this.dialog.set(false);
                this.modelValueChange.emit(false);
            }
        });
    }

    get dialogWidth(): string {
        return typeof this.width === 'number' ? `${this.width}px` : this.width;
    }

    get dialogMaxWidth(): string | null {
        if (!this.maxWidth) return null;
        return typeof this.maxWidth === 'number' ? `${this.maxWidth}px` : this.maxWidth;
    }

    get dialogClass(): string {
        return this.top ? 'top-dialog' : '';
    }

    open(): void {
        this.dialog.set(true);
        this.modelValueChange.emit(true);
    }

    closeDialog(): void {
        this.dialog.set(false);
        this.modelValueChange.emit(false);
    }

    onCancel(): void {
        this.cancel.emit();
        this.closeDialog();
    }

    onSubmit(): void {
        this.submit.emit();
        this.submitted.set(true);
    }

    onConfirm(): void {
        this.confirm.emit();
        this.closeDialog();
    }

    onDelete(): void {
        this.delete.emit();
        this.submitted.set(true);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onSubmit();
        } else if (event.key === 'Escape') {
            this.onCancel();
        }
    }

    get hasBelowActionsSlot(): boolean {
        // This would need to be implemented with ContentChild to check for slot content
        // For now, return false
        return false;
    }
} 