import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

export interface ButtonOption {
    icon?: string;
    color?: string;
    text: string;
    event: string;
    children?: ButtonOption[];
    disabled?: boolean;
    divider?: boolean;
}

@Component({
    selector: 'app-base-button-group',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatDividerModule,
        MatListModule
    ],
    templateUrl: './base-button-group.component.html',
    styleUrls: ['./base-button-group.component.scss']
})
export class BaseButtonGroupComponent {
    @Input() buttons: ButtonOption[] = [];
    @Input() large: boolean = true;
    @Input() stretch: boolean = false;
    @Output() buttonClick = new EventEmitter<string>();

    get maxButtonWidth(): string {
        return `${100 / this.buttons.length}%`;
    }

    onButtonClick(event: string): void {
        this.buttonClick.emit(event);
    }
} 