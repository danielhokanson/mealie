import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../base-button/base-button.component';

export interface LabelType {
    id: string;
    name: string;
}

@Component({
    selector: 'app-input-label-type',
    standalone: true,
    imports: [
        CommonModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        BaseButtonComponent
    ],
    templateUrl: './input-label-type.component.html',
    styleUrls: ['./input-label-type.component.scss']
})
export class InputLabelTypeComponent {
    @ViewChild('autocomplete') autocomplete: any;

    @Input() modelValue: LabelType | null = null;
    @Input() items: LabelType[] = [];
    @Input() itemId?: string | number;
    @Input() icon?: string;
    @Input() create: boolean = false;

    @Output() modelValueChange = new EventEmitter<LabelType | null>();
    @Output() itemIdChange = new EventEmitter<string | number | undefined>();
    @Output() createItem = new EventEmitter<string>();

    searchInput: string = '';

    get itemIdValue(): string | number | undefined {
        return this.itemId;
    }

    set itemIdValue(value: string | number | undefined) {
        this.itemId = value;
        this.itemIdChange.emit(value);
    }

    get itemValue(): LabelType | null {
        try {
            return this.modelValue && Object.keys(this.modelValue).length !== 0 ? this.modelValue : null;
        } catch {
            return null;
        }
    }

    set itemValue(value: LabelType | null) {
        this.itemIdValue = value?.id;
        this.modelValueChange.emit(value);
    }

    emitCreate(): void {
        if (this.items.some(item => item.name === this.searchInput)) {
            return;
        }
        this.createItem.emit(this.searchInput);
        this.autocomplete?.blur();
    }

    hasExistingItem(): boolean {
        return this.items ? this.items.some((item: any) => item.name === this.searchInput) : false;
    }

    displayFn(item: LabelType): string {
        return item ? item.name : '';
    }

    onInputChange(event: any): void {
        const value = event.target.value;
        if (value) {
            const selectedItem = this.items.find(item => item.name === value);
            if (selectedItem) {
                this.itemValue = selectedItem;
            }
        }
    }
} 