import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-toggle-state',
    standalone: true,
    imports: [
        CommonModule,
        MatSlideToggleModule,
        FormsModule
    ],
    templateUrl: './toggle-state.component.html',
    styleUrls: ['./toggle-state.component.scss']
})
export class ToggleStateComponent {
    @Input() modelValue: boolean = false;
    @Input() label: string = '';
    @Input() disabled: boolean = false;

    @Output() modelValueChange = new EventEmitter<boolean>();

    onToggleChange(value: boolean): void {
        this.modelValue = value;
        this.modelValueChange.emit(value);
    }
} 