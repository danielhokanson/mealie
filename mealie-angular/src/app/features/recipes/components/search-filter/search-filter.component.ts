import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface FilterItem {
    id: string;
    name: string;
    color?: string;
}

@Component({
    selector: 'app-search-filter',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatChipsModule
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchFilterComponent),
            multi: true
        }
    ],
    templateUrl: './search-filter.component.html',
    styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements ControlValueAccessor {
    @Input() items: FilterItem[] = [];
    @Input() label = '';
    @Input() icon = '';
    @Input() multiple = true;
    @Input() radio = false;
    @Input() selectedItems: string[] = [];
    @Input() requireAll = false;

    @Output() selectedItemsChange = new EventEmitter<string[]>();
    @Output() requireAllChange = new EventEmitter<boolean>();
    @Output() selectionChange = new EventEmitter<void>();

    disabled = false;
    private onChange = (value: string[]) => { };
    private onTouched = () => { };

    writeValue(value: string[]): void {
        this.selectedItems = value || [];
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onSelectionChange(): void {
        this.onChange(this.selectedItems);
        this.onTouched();
        this.selectedItemsChange.emit(this.selectedItems);
        this.selectionChange.emit();
    }

    onRequireAllChange(): void {
        this.requireAllChange.emit(this.requireAll);
        this.selectionChange.emit();
    }

    toggleItem(itemId: string): void {
        if (this.radio) {
            this.selectedItems = [itemId];
        } else {
            const index = this.selectedItems.indexOf(itemId);
            if (index > -1) {
                this.selectedItems.splice(index, 1);
            } else {
                this.selectedItems.push(itemId);
            }
        }
        this.onSelectionChange();
    }

    removeItem(itemId: string): void {
        const index = this.selectedItems.indexOf(itemId);
        if (index > -1) {
            this.selectedItems.splice(index, 1);
            this.onSelectionChange();
        }
    }

    clearSelection(): void {
        this.selectedItems = [];
        this.onSelectionChange();
    }

    getSelectedItems(): FilterItem[] {
        return this.items.filter(item => this.selectedItems.includes(item.id));
    }

    getItemName(itemId: string): string {
        const item = this.items.find(i => i.id === itemId);
        return item ? item.name : itemId;
    }

    getItemColor(itemId: string): string {
        const item = this.items.find(i => i.id === itemId);
        return item?.color || '';
    }
} 