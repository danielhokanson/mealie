import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Recipe {
    id: string;
    name: string;
    slug: string;
    // ... other recipe properties
}

@Component({
    selector: 'app-recipe-action-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule
    ],
    templateUrl: './recipe-action-menu.component.html',
    styleUrls: ['./recipe-action-menu.component.scss']
})
export class RecipeActionMenuComponent {
    @Input() recipe!: Recipe;
    @Input() slug = '';
    @Input() recipeScale = 1;
    @Input() canEdit = false;
    @Input() name = '';
    @Input() loggedIn = false;
    @Input() open = false;
    @Input() recipeId = '';

    @Output() close = new EventEmitter<void>();
    @Output() json = new EventEmitter<void>();
    @Output() edit = new EventEmitter<void>();
    @Output() save = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    @Output() print = new EventEmitter<void>();

    onEdit(): void {
        this.edit.emit();
    }

    onSave(): void {
        this.save.emit();
    }

    onDelete(): void {
        this.delete.emit();
    }

    onPrint(): void {
        this.print.emit();
    }
} 