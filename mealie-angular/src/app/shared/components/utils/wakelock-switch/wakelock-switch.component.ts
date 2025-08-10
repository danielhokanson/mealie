import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-wakelock-switch',
    standalone: true,
    imports: [
        CommonModule,
        MatSlideToggleModule,
        MatIconModule,
        MatTooltipModule,
        FormsModule
    ],
    templateUrl: './wakelock-switch.component.html',
    styleUrls: ['./wakelock-switch.component.scss']
})
export class WakelockSwitchComponent implements OnInit, OnDestroy {
    @Input() modelValue: boolean = false;
    @Input() label: string = 'Keep Screen Awake';
    @Input() disabled: boolean = false;

    @Output() modelValueChange = new EventEmitter<boolean>();

    private wakeLock: any = null;
    private wakeLockSupported: boolean = false;

    ngOnInit(): void {
        this.checkWakeLockSupport();
        this.initializeWakeLock();
    }

    ngOnDestroy(): void {
        this.releaseWakeLock();
    }

    private checkWakeLockSupport(): void {
        this.wakeLockSupported = 'wakeLock' in navigator;
    }

    private async initializeWakeLock(): Promise<void> {
        if (!this.wakeLockSupported) {
            console.warn('Wake Lock API is not supported in this browser');
            return;
        }

        try {
            this.wakeLock = await (navigator as any).wakeLock.request('screen');
            this.modelValue = true;
            this.modelValueChange.emit(true);
        } catch (err) {
            console.error('Failed to acquire wake lock:', err);
            this.modelValue = false;
            this.modelValueChange.emit(false);
        }
    }

    private async releaseWakeLock(): Promise<void> {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
            } catch (err) {
                console.error('Failed to release wake lock:', err);
            }
        }
    }

    async onToggleChange(value: boolean): Promise<void> {
        if (this.disabled || !this.wakeLockSupported) {
            return;
        }

        if (value) {
            try {
                this.wakeLock = await (navigator as any).wakeLock.request('screen');
                this.modelValue = true;
                this.modelValueChange.emit(true);
            } catch (err) {
                console.error('Failed to acquire wake lock:', err);
                this.modelValue = false;
                this.modelValueChange.emit(false);
            }
        } else {
            await this.releaseWakeLock();
            this.modelValue = false;
            this.modelValueChange.emit(false);
        }
    }

    get isSupported(): boolean {
        return this.wakeLockSupported;
    }

    get tooltipText(): string {
        if (!this.isSupported) {
            return 'Wake Lock API is not supported in this browser';
        }
        if (this.disabled) {
            return 'Wake lock is disabled';
        }
        return this.label;
    }
} 