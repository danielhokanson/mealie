import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export interface RecipeTimelineEvent {
    id: string;
    recipeId: string;
    userId: string;
    subject: string;
    eventMessage: string;
    image?: string;
    timestamp: Date;
    eventType: string;
}

@Component({
    selector: 'app-recipe-timeline-context-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule
    ],
    templateUrl: './recipe-timeline-context-menu.component.html',
    styleUrls: ['./recipe-timeline-context-menu.component.scss']
})
export class RecipeTimelineContextMenuComponent {
    @Input() event!: RecipeTimelineEvent;
    @Input() useMobileFormat = false;
    @Input() menuTop = false;
    @Input() menuIcon = 'more_vert';
    @Input() color = 'transparent';
    @Input() elevation = 0;
    @Input() cardMenu = false;
    @Input() useItems = {
        edit: true,
        delete: true
    };

    @Output() update = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();

    onUpdate(): void {
        this.update.emit();
    }

    onDelete(): void {
        this.delete.emit();
    }
} 