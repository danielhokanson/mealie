import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-doc-link',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './doc-link.component.html',
    styleUrls: ['./doc-link.component.scss']
})
export class DocLinkComponent {
    @Input() href: string = '';
    @Input() text: string = 'Documentation';
    @Input() color: string = 'primary';
    @Input() variant: 'text' | 'outlined' | 'raised' = 'text';
} 