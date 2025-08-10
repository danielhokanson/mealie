import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

export interface OverflowItem {
    text: string;
    icon?: string;
    value?: any;
    to?: string;
    event?: string;
    divider?: boolean;
    hide?: boolean;
}

export enum OverflowModes {
    MODEL = 'model',
    LINK = 'link',
    EVENT = 'event'
}

@Component({
    selector: 'app-base-overflow-button',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatListModule,
        MatDividerModule
    ],
    templateUrl: './base-overflow-button.component.html',
    styleUrls: ['./base-overflow-button.component.scss']
})
export class BaseOverflowButtonComponent {
    @Input() items: OverflowItem[] = [];
    @Input() mode: OverflowModes = OverflowModes.MODEL;
    @Input() btnText: string = '';
    @Input() disabled: boolean = false;
    @Input() btnClass: string = '';

    @Output() valueChange = new EventEmitter<any>();
    @Output() itemClick = new EventEmitter<string>();

    MODES = OverflowModes;
    selectedValue: any = null;

    constructor(private router: Router) { }

    get activeObj(): OverflowItem {
        if (this.mode === OverflowModes.MODEL && this.selectedValue) {
            return this.items.find(item => item.value === this.selectedValue) || this.items[0];
        }
        return this.items[0];
    }

    get displayText(): string {
        return this.mode === OverflowModes.MODEL ? this.activeObj.text : this.btnText;
    }

    setValue(item: OverflowItem): void {
        this.selectedValue = item.value;
        this.valueChange.emit(item.value);
    }

    onItemClick(item: OverflowItem): void {
        if (item.event) {
            this.itemClick.emit(item.event);
        }
    }

    navigateTo(item: OverflowItem): void {
        if (item.to) {
            this.router.navigate([item.to]);
        }
    }
} 