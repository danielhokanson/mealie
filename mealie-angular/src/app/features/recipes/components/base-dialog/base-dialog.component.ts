import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-base-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
        <div class="dialog-container">
            <div class="dialog-header">
                <h2 mat-dialog-title>{{ title }}</h2>
                <button mat-icon-button (click)="onClose()">
                    <mat-icon>close</mat-icon>
                </button>
            </div>
            <div class="dialog-content">
                <ng-content></ng-content>
            </div>
            <div class="dialog-actions">
                <button mat-button (click)="onClose()">Cancel</button>
                <button 
                    *ngIf="canConfirm" 
                    mat-raised-button 
                    color="primary" 
                    (click)="onConfirm()"
                    [disabled]="!canConfirm">
                    {{ confirmText }}
                </button>
                <ng-content select="[dialog-actions]"></ng-content>
            </div>
        </div>
    `,
    styles: [`
        .dialog-container {
            padding: 0;
        }
        .dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px 0;
        }
        .dialog-content {
            padding: 16px 24px;
        }
        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 0 24px 16px;
        }
    `]
})
export class BaseDialogComponent {
    @Input() title: string = '';
    @Input() modelValue: boolean = false;
    @Input() canConfirm: boolean = true;
    @Input() confirmText: string = 'Confirm';
    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<void>();
    @Output() modelValueChange = new EventEmitter<boolean>();

    constructor(public dialogRef: MatDialogRef<BaseDialogComponent>) { }

    onClose(): void {
        this.close.emit();
        this.modelValueChange.emit(false);
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.confirm.emit();
        this.modelValueChange.emit(false);
        this.dialogRef.close();
    }
}

