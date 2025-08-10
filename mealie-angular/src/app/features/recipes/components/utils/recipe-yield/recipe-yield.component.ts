import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-recipe-yield',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './recipe-yield.component.html',
    styleUrls: ['./recipe-yield.component.scss']
})
export class RecipeYieldComponent {
    @Input() yieldQuantity?: number;
    @Input() yieldText?: string;
    @Input() scale = 1;
    @Input() color = 'accent';

    constructor(private sanitizer: DomSanitizer) { }

    get yieldDisplay(): SafeHtml | null {
        const components: string[] = [];

        // Add scaled quantity if available
        if (this.yieldQuantity && this.scale) {
            const scaledQuantity = this.yieldQuantity * this.scale;
            components.push(scaledQuantity.toString());
        }

        // Add yield text if available
        if (this.yieldText) {
            components.push(this.yieldText);
        }

        if (components.length === 0) {
            return null;
        }

        const html = components.join(' ');
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    get scaledAmountDisplay(): string {
        if (!this.yieldQuantity || !this.scale) {
            return '';
        }
        return (this.yieldQuantity * this.scale).toString();
    }
} 