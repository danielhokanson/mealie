import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

export interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag?: string;
}

@Component({
    selector: 'app-language-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatDividerModule,
        MatCardModule
    ],
    templateUrl: './language-dialog.component.html',
    styleUrls: ['./language-dialog.component.scss']
})
export class LanguageDialogComponent {
    @Input() languages: Language[] = [];
    @Input() currentLanguage: string = 'en';

    @Output() languageChange = new EventEmitter<string>();

    constructor(private dialogRef: MatDialogRef<LanguageDialogComponent>) { }

    onLanguageSelect(languageCode: string): void {
        this.currentLanguage = languageCode;
        this.languageChange.emit(languageCode);
        this.dialogRef.close(languageCode);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    getFlagEmoji(countryCode: string): string {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    getLanguageDisplay(language: Language): string {
        if (language.nativeName && language.nativeName !== language.name) {
            return `${language.name} (${language.nativeName})`;
        }
        return language.name;
    }
} 