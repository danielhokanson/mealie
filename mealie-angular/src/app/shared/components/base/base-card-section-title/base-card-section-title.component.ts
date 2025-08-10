import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-base-card-section-title',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './base-card-section-title.component.html',
    styleUrls: ['./base-card-section-title.component.scss']
})
export class BaseCardSectionTitleComponent {
    @Input() title: string = '';
    @Input() icon?: string;
    @Input() color: string = 'primary';
} 