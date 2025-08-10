import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-base-page-title',
    standalone: true,
    imports: [
        CommonModule,
        MatDividerModule
    ],
    templateUrl: './base-page-title.component.html',
    styleUrls: ['./base-page-title.component.scss']
})
export class BasePageTitleComponent {
    @Input() divider: boolean = false;
} 