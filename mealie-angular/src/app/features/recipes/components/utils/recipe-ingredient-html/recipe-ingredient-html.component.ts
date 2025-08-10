import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-recipe-ingredient-html',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './recipe-ingredient-html.component.html',
    styleUrls: ['./recipe-ingredient-html.component.scss']
})
export class RecipeIngredientHtmlComponent {
    @Input() markup = '';

    constructor(private sanitizer: DomSanitizer) { }

    get sanitizedMarkup(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.markup);
    }
} 