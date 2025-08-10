import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-help-icon',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './help-icon.component.html',
    styleUrls: ['./help-icon.component.scss']
})
export class HelpIconComponent {
    @Input() text: string = '';
    @Input() color: string = 'primary';
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
} 