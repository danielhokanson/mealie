import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface RecipeAsset {
    id: string;
    name: string;
    fileName: string;
    extension: string;
    path: string;
}

@Component({
    selector: 'app-recipe-assets',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule
    ],
    templateUrl: './recipe-assets.component.html',
    styleUrls: ['./recipe-assets.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RecipeAssetsComponent),
            multi: true
        }
    ]
})
export class RecipeAssetsComponent implements ControlValueAccessor {
    @Input() edit = false;
    @Input() slug = '';
    @Input() recipeId = '';

    assets: RecipeAsset[] = [];

    private onChange = (value: RecipeAsset[]) => { };
    private onTouched = () => { };

    // ControlValueAccessor implementation
    writeValue(value: RecipeAsset[]): void {
        this.assets = value || [];
    }

    registerOnChange(fn: (value: RecipeAsset[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Implementation for disabled state
    }
} 