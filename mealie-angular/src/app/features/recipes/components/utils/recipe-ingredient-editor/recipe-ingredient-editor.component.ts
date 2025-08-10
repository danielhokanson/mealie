import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BaseButtonComponent } from '../base-button/base-button.component';
import { BaseButtonGroupComponent } from '../base-button-group/base-button-group.component';

export interface RecipeIngredient {
    title?: string;
    quantity?: number;
    unit?: any;
    food?: any;
    note?: string;
    originalText?: string;
}

export interface Food {
    id: string;
    name: string;
    pluralName?: string;
}

export interface Unit {
    id: string;
    name: string;
}

@Component({
    selector: 'app-recipe-ingredient-editor',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        MatTooltipModule,
        MatDividerModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        BaseButtonComponent,
        BaseButtonGroupComponent
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RecipeIngredientEditorComponent),
            multi: true
        }
    ],
    templateUrl: './recipe-ingredient-editor.component.html',
    styleUrls: ['./recipe-ingredient-editor.component.scss']
})
export class RecipeIngredientEditorComponent implements ControlValueAccessor {
    @Input() disableAmount = false;
    @Input() unitError = false;
    @Input() unitErrorTooltip = '';
    @Input() foodError = false;
    @Input() foodErrorTooltip = '';
    @Input() showTitle = false;

    @Output() clickIngredientField = new EventEmitter<string>();
    @Output() insertAbove = new EventEmitter<void>();
    @Output() insertBelow = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();

    value: RecipeIngredient = {};
    showOriginalText = false;
    unitSearch = '';
    foodSearch = '';

    // Mock data - in a real app, these would come from services
    foods: Food[] = [
        { id: '1', name: 'Flour', pluralName: 'Flours' },
        { id: '2', name: 'Sugar', pluralName: 'Sugars' },
        { id: '3', name: 'Salt', pluralName: 'Salts' }
    ];

    units: Unit[] = [
        { id: '1', name: 'cup' },
        { id: '2', name: 'tablespoon' },
        { id: '3', name: 'teaspoon' },
        { id: '4', name: 'gram' },
        { id: '5', name: 'ounce' }
    ];

    get contextMenuOptions(): any[] {
        const options = [
            {
                text: 'Toggle Section',
                event: 'toggle-section'
            },
            {
                text: 'Insert Above',
                event: 'insert-above'
            },
            {
                text: 'Insert Below',
                event: 'insert-below'
            }
        ];

        if (this.value.originalText) {
            options.push({
                text: 'See Original Text',
                event: 'toggle-original'
            });
        }

        return options;
    }

    get buttons(): any[] {
        const buttons = [
            {
                icon: 'more_vert',
                text: 'Menu',
                event: 'open',
                children: this.contextMenuOptions
            }
        ];

        buttons.unshift({
            icon: 'delete',
            text: 'Delete',
            event: 'delete',
            children: undefined
        });

        return buttons;
    }

    get isMdAndUp(): boolean {
        return window.innerWidth >= 960;
    }

    // ControlValueAccessor implementation
    private onChange = (value: RecipeIngredient) => { };
    private onTouched = () => { };

    writeValue(value: RecipeIngredient): void {
        this.value = value || {};
    }

    registerOnChange(fn: (value: RecipeIngredient) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Handle disabled state if needed
    }

    // Event handlers
    onValueChange(): void {
        this.onChange(this.value);
        this.onTouched();
    }

    onTitleChange(): void {
        this.onValueChange();
    }

    onQuantityChange(): void {
        this.onValueChange();
    }

    onUnitChange(): void {
        this.onValueChange();
    }

    onFoodChange(): void {
        this.onValueChange();
    }

    onNoteChange(): void {
        this.onValueChange();
    }

    onUnitSearchChange(event: any): void {
        this.unitSearch = event.target.value;
    }

    onFoodSearchChange(event: any): void {
        this.foodSearch = event.target.value;
    }

    onUnitEnter(): void {
        if (!this.value.unit || !this.value.unit.name?.includes(this.unitSearch)) {
            this.createAssignUnit();
        }
    }

    onFoodEnter(): void {
        if (!this.value.food || !this.value.food.name?.includes(this.foodSearch)) {
            this.createAssignFood();
        }
    }

    createAssignUnit(): void {
        // In a real app, this would create a new unit
        const newUnit: Unit = {
            id: Date.now().toString(),
            name: this.unitSearch
        };
        this.value.unit = newUnit;
        this.onValueChange();
    }

    createAssignFood(): void {
        // In a real app, this would create a new food
        const newFood: Food = {
            id: Date.now().toString(),
            name: this.foodSearch
        };
        this.value.food = newFood;
        this.onValueChange();
    }

    toggleTitle(): void {
        if (this.showTitle) {
            this.value.title = '';
        }
        this.showTitle = !this.showTitle;
        this.onValueChange();
    }

    toggleOriginalText(): void {
        this.showOriginalText = !this.showOriginalText;
    }

    quantityFilter(event: KeyboardEvent): void {
        if (event.key === '-' || event.key === '+' || event.key === 'e') {
            event.preventDefault();
        }
    }

    onButtonClick(event: string): void {
        switch (event) {
            case 'toggle-section':
                this.toggleTitle();
                break;
            case 'toggle-original':
                this.toggleOriginalText();
                break;
            case 'insert-above':
                this.insertAbove.emit();
                break;
            case 'insert-below':
                this.insertBelow.emit();
                break;
            case 'delete':
                this.delete.emit();
                break;
        }
    }

    onFieldClick(field: string): void {
        this.clickIngredientField.emit(field);
    }
} 