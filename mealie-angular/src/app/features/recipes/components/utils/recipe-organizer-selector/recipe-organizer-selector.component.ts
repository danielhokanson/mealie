import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface OrganizerItem {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

@Component({
    selector: 'app-recipe-organizer-selector',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './recipe-organizer-selector.component.html',
    styleUrls: ['./recipe-organizer-selector.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RecipeOrganizerSelectorComponent),
            multi: true
        }
    ]
})
export class RecipeOrganizerSelectorComponent implements ControlValueAccessor {
    @Input() selectorType: 'categories' | 'tags' | 'tools' = 'categories';
    @Input() returnObject = false;
    @Input() showAdd = false;

    selectedItems: OrganizerItem[] = [];
    availableItems: OrganizerItem[] = [];
    newItemName = '';

    private onChange = (value: OrganizerItem[]) => { };
    private onTouched = () => { };

    ngOnInit(): void {
        this.loadAvailableItems();
    }

    private loadAvailableItems(): void {
        // In a real app, you'd load items from the backend based on selectorType
        // this.availableItems = await this.recipeService.getOrganizerItems(this.selectorType);
    }

    getSelectorLabel(): string {
        switch (this.selectorType) {
            case 'categories': return 'Categories';
            case 'tags': return 'Tags';
            case 'tools': return 'Tools';
            default: return 'Items';
        }
    }

    onSelectionChange(items: OrganizerItem[]): void {
        this.selectedItems = items;
        this.onChange(items);
    }

    addNewItem(): void {
        if (!this.newItemName.trim()) return;

        const newItem: OrganizerItem = {
            id: this.generateId(),
            name: this.newItemName.trim(),
            slug: this.generateSlug(this.newItemName.trim())
        };

        this.selectedItems.push(newItem);
        this.availableItems.push(newItem);
        this.newItemName = '';
        this.onChange(this.selectedItems);
    }

    removeItem(item: OrganizerItem): void {
        this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
        this.onChange(this.selectedItems);
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    private generateSlug(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // ControlValueAccessor implementation
    writeValue(value: OrganizerItem[]): void {
        this.selectedItems = value || [];
    }

    registerOnChange(fn: (value: OrganizerItem[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Implementation for disabled state
    }
} 