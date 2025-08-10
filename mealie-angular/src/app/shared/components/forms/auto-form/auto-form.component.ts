import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../base-button/base-button.component';
import { InputLabelTypeComponent } from '../input-label-type/input-label-type.component';

export interface AutoFormItem {
    varName: string;
    label: string;
    type: string;
    hint?: string;
    section?: string;
    sectionDetails?: string;
    rules?: string[];
    disableUpdate?: boolean;
    disableCreate?: boolean;
    items?: AutoFormItem[];
    options?: any[];
    color?: string;
    min?: number;
    max?: number;
    step?: number;
}

export interface ValidatorKey {
    key: string;
    params?: any;
}

@Component({
    selector: 'app-auto-form',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatMenuModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        FormsModule,
        ReactiveFormsModule,
        BaseButtonComponent,
        InputLabelTypeComponent
    ],
    templateUrl: './auto-form.component.html',
    styleUrls: ['./auto-form.component.scss']
})
export class AutoFormComponent {
    @Input() updateMode: boolean = false;
    @Input() items: AutoFormItem[] = [];
    @Input() width: string | number = 'max';
    @Input() globalRules?: string[];
    @Input() color?: string;
    @Input() dark: boolean = false;
    @Input() disabledFields?: string[];
    @Input() readonlyFields?: string[];

    @Output() blur = new EventEmitter<any>();
    @Output() modelValueChange = new EventEmitter<any>();

    modelValue: any = {};

    readonly fieldTypes = {
        BOOLEAN: 'boolean',
        TEXT: 'text',
        PASSWORD: 'password',
        TEXT_AREA: 'textarea',
        SELECT: 'select',
        MULTI_SELECT: 'multi-select',
        NUMBER: 'number',
        SLIDER: 'slider',
        COLOR: 'color',
        OBJECT: 'object',
        LIST: 'list',
        DATE: 'date',
        TIME: 'time',
        DATETIME: 'datetime'
    };

    readonly validators = {
        required: (value: string) => !!value || 'This field is required',
        email: (value: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) || 'Invalid email format';
        },
        min: (min: number) => (value: string) => {
            const num = parseFloat(value);
            return !isNaN(num) && num >= min || `Minimum value is ${min}`;
        },
        max: (max: number) => (value: string) => {
            const num = parseFloat(value);
            return !isNaN(num) && num <= max || `Maximum value is ${max}`;
        },
        minLength: (min: number) => (value: string) => {
            return value.length >= min || `Minimum length is ${min}`;
        },
        maxLength: (max: number) => (value: string) => {
            return value.length <= max || `Maximum length is ${max}`;
        }
    };

    get defaultRules(): ((value: string) => boolean | string)[] {
        return this.rulesByKey(this.globalRules || []);
    }

    rulesByKey(keys?: string[]): ((value: string) => boolean | string)[] {
        if (!keys || keys.length === 0) {
            return [];
        }

        const list: ((value: string) => boolean | string)[] = [];
        keys.forEach((key) => {
            const split = key.split(':');
            const validatorKey = split[0] as keyof typeof this.validators;
            if (validatorKey in this.validators) {
                if (split.length === 1) {
                    list.push(this.validators[validatorKey] as (value: string) => boolean | string);
                } else {
                    const validator = this.validators[validatorKey] as any;
                    list.push(validator(split[1]));
                }
            }
        });
        return list;
    }

    isFieldDisabled(field: AutoFormItem): boolean {
        return (field.disableUpdate && this.updateMode) ||
            (!this.updateMode && field.disableCreate) ||
            (this.disabledFields && this.disabledFields.includes(field.varName)) || false;
    }

    isFieldReadonly(field: AutoFormItem): boolean {
        return (field.disableUpdate && this.updateMode) ||
            (!this.updateMode && field.disableCreate) ||
            (this.readonlyFields && this.readonlyFields.includes(field.varName)) || false;
    }

    getFieldRules(field: AutoFormItem): ((value: string) => boolean | string)[] {
        if (this.isFieldDisabled(field)) {
            return [];
        }
        return [...this.rulesByKey(field.rules), ...this.defaultRules];
    }

    onFieldChange(fieldName: string, value: any): void {
        this.modelValue[fieldName] = value;
        this.modelValueChange.emit(this.modelValue);
    }

    onFieldBlur(): void {
        this.blur.emit(this.modelValue);
    }

    removeByIndex(list: any[], index: number): void {
        list.splice(index, 1);
    }

    addListItem(field: AutoFormItem): void {
        if (!this.modelValue[field.varName]) {
            this.modelValue[field.varName] = [];
        }
        this.modelValue[field.varName].push('');
    }

    getTemplate(items: AutoFormItem[]): any {
        const obj: any = {};
        items.forEach((field) => {
            obj[field.varName] = '';
        });
        return obj;
    }

    trackByIndex(index: number): number {
        return index;
    }
} 