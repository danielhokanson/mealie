import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-advanced-only',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './advanced-only.component.html',
    styleUrls: ['./advanced-only.component.scss']
})
export class AdvancedOnlyComponent {
    @Input() show: boolean = false;
} 