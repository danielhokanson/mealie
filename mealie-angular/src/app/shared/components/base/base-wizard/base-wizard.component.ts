import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-base-wizard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatDividerModule,
        MatToolbarModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './base-wizard.component.html',
    styleUrls: ['./base-wizard.component.scss']
})
export class BaseWizardComponent {
    @Input() modelValue: number = 0;
    @Input() minPageNumber: number = 0;
    @Input() maxPageNumber: number = 0;
    @Input() width: string | number = '1200px';
    @Input() pageWidth: string | number = '600px';
    @Input() prevButtonText?: string;
    @Input() prevButtonIcon?: string | null;
    @Input() prevButtonColor: string = 'grey-darken-3';
    @Input() prevButtonShow: boolean = true;
    @Input() prevButtonEnable: boolean = true;
    @Input() nextButtonText?: string;
    @Input() nextButtonIcon?: string | null;
    @Input() nextButtonIconAfter: boolean = true;
    @Input() nextButtonColor?: string;
    @Input() nextButtonShow: boolean = true;
    @Input() nextButtonEnable: boolean = true;
    @Input() nextButtonIsSubmit: boolean = false;
    @Input() title: string = '';
    @Input() icon?: string | null;
    @Input() isSubmitting: boolean = false;

    @Output() modelValueChange = new EventEmitter<number>();
    @Output() submit = new EventEmitter<number>();

    langDialog: boolean = false;

    get wizardPage(): number {
        return this.modelValue;
    }

    set wizardPage(value: number) {
        this.modelValue = value;
        this.modelValueChange.emit(value);
    }

    get prevButtonTextRef(): string {
        return this.prevButtonText || 'Back';
    }

    get prevButtonIconRef(): string | null {
        return this.prevButtonIcon || 'arrow_back';
    }

    get nextButtonTextRef(): string {
        return this.nextButtonText || (this.nextButtonIsSubmit ? 'Submit' : 'Next');
    }

    get nextButtonIconRef(): string | null {
        return this.nextButtonIcon || (this.nextButtonIsSubmit ? 'check' : 'arrow_forward');
    }

    get nextButtonColorRef(): string {
        return this.nextButtonColor || (this.nextButtonIsSubmit ? 'success' : 'info');
    }

    get progressValue(): number {
        return Math.ceil((this.wizardPage / this.maxPageNumber) * 100);
    }

    goToPage(page: number): void {
        if (page < this.minPageNumber) {
            this.goToPage(this.minPageNumber);
            return;
        } else if (page > this.maxPageNumber) {
            this.goToPage(this.maxPageNumber);
            return;
        }
        this.wizardPage = page;
    }

    decrementPage(): void {
        this.goToPage(this.wizardPage - 1);
    }

    incrementPage(): void {
        if (this.nextButtonIsSubmit) {
            this.submit.emit(this.wizardPage);
        } else {
            this.goToPage(this.wizardPage + 1);
        }
    }
} 