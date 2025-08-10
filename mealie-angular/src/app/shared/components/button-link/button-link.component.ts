import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-button-link',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './button-link.component.html',
    styleUrls: ['./button-link.component.scss']
})
export class ButtonLinkComponent {
    @Input() to: string = '';
    @Input() color: string = 'primary';
    @Input() variant: 'text' | 'outlined' | 'raised' = 'text';

    constructor(private router: Router) { }

    navigate(): void {
        if (this.to) {
            this.router.navigate([this.to]);
        }
    }
} 