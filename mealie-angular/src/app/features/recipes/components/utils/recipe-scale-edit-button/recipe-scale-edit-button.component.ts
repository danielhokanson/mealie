import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { BaseButtonGroupComponent } from '../base-button-group/base-button-group.component';

@Component({
    selector: 'app-recipe-scale-edit-button',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        BaseButtonGroupComponent
    ],
    templateUrl: './recipe-scale-edit-button.component.html',
    styleUrls: ['./recipe-scale-edit-button.component.scss']
})
export class RecipeScaleEditButtonComponent {
    @Input() recipeServings = 0;
    @Input() editScale = false;
    @Input() scale = 1;

    @Output() scaleChange = new EventEmitter<number>();

    menuOpen = false;

    get canEditScale(): boolean {
        return this.editScale && this.recipeServings > 0;
    }

    get yieldQuantity(): number {
        return this.recipeServings * this.scale;
    }

    get yieldDisplay(): string {
        return this.yieldQuantity > 0 ? `Serves ${this.yieldQuantity}` : '';
    }

    get disableDecrement(): boolean {
        return this.yieldQuantity <= 1;
    }

    get buttons(): any[] {
        return [
            {
                icon: 'remove',
                text: 'Decrease Scale',
                event: 'decrement',
                disabled: this.disableDecrement
            },
            {
                icon: 'add',
                text: 'Increase Scale',
                event: 'increment'
            }
        ];
    }

    recalculateScale(newYield: number): void {
        if (isNaN(newYield) || newYield <= 0) {
            return;
        }

        if (this.recipeServings <= 0) {
            this.updateScale(1);
        } else {
            const newScale = newYield / this.recipeServings;
            this.updateScale(newScale);
        }
    }

    updateScale(newScale: number): void {
        this.scale = newScale;
        this.scaleChange.emit(newScale);
    }

    onDecrement(): void {
        this.recalculateScale(this.yieldQuantity - 1);
    }

    onIncrement(): void {
        this.recalculateScale(this.yieldQuantity + 1);
    }

    onReset(): void {
        this.updateScale(1);
    }

    onYieldQuantityChange(event: any): void {
        const value = parseFloat(event.target.value) || 0;
        this.recalculateScale(value);
    }
} 