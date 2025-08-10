import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ButtonConfig {
    icon?: string;
    text?: string;
    event?: string;
    color?: string;
    disabled?: boolean;
    children?: ButtonConfig[];
}

@Component({
    selector: 'app-base-button',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './base-button.component.html',
    styleUrls: ['./base-button.component.scss']
})
export class BaseButtonComponent {
    @Input() icon?: string;
    @Input() text?: string;
    @Input() color = 'primary';
    @Input() variant: 'flat' | 'raised' | 'stroked' | 'basic' = 'basic';
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
    @Input() disabled = false;
    @Input() block = false;
    @Input() loading = false;
    @Input() create = false;
    @Input() edit = false;
    @Input() delete = false;
    @Input() save = false;
    @Input() cancel = false;
    @Input() secondary = false;
    @Input() iconRight = false;

    @Output() click = new EventEmitter<void>();

    get buttonColor(): string {
        if (this.delete) return 'warn';
        if (this.secondary) return 'accent';
        return this.color;
    }

    get buttonIcon(): string {
        if (this.create) return 'add';
        if (this.edit) return 'edit';
        if (this.delete) return 'delete';
        if (this.save) return 'save';
        if (this.cancel) return 'close';
        return this.icon || '';
    }

    get btnStyle(): any {
        return {
            outlined: this.variant === 'stroked',
            text: this.variant === 'basic'
        };
    }

    onButtonClick(): void {
        if (!this.disabled && !this.loading) {
            this.click.emit();
        }
    }

    get buttonClass(): string {
        const classes = ['base-button'];
        if (this.block) classes.push('block');
        if (this.loading) classes.push('loading');
        return classes.join(' ');
    }

    get buttonSize(): string {
        switch (this.size) {
            case 'small': return 'small';
            case 'large': return 'large';
            default: return 'medium';
        }
    }
}
