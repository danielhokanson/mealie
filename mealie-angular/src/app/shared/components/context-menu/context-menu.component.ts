import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';

export interface ContextMenuItem {
    title: string;
    icon: string;
    event: string;
    color?: string;
}

@Component({
    selector: 'app-context-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatListModule
    ],
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
    @Input() items: ContextMenuItem[] = [];
    @Input() menuTop: boolean = true;
    @Input() fab: boolean = false;
    @Input() color: string = 'grey-darken-2';

    @Output() menuClick = new EventEmitter<string>();

    onItemClick(event: string): void {
        this.menuClick.emit(event);
    }
} 