import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-base-divider',
    standalone: true,
    imports: [
        CommonModule,
        MatDividerModule
    ],
    templateUrl: './base-divider.component.html',
    styleUrls: ['./base-divider.component.scss']
})
export class BaseDividerComponent {
    @Input() vertical: boolean = false;
    @Input() inset: boolean = false;
} 