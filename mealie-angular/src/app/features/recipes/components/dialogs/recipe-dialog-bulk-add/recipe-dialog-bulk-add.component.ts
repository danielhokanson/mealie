import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTextareaModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';

import { BaseButtonComponent } from '../base-button/base-button.component';

export interface BulkUtility {
    id: string;
    description: string;
    action: () => void;
}

@Component({
    selector: 'app-recipe-dialog-bulk-add',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatTextareaModule,
        MatDividerModule,
        MatListModule,
        FormsModule,
        BaseButtonComponent
    ],
    templateUrl: './recipe-dialog-bulk-add.component.html',
    styleUrls: ['./recipe-dialog-bulk-add.component.scss']
})
export class RecipeDialogBulkAddComponent {
    @Input() inputTextProp = '';

    @Output() bulkData = new EventEmitter<string[]>();

    dialog = false;
    inputText = '';

    utilities: BulkUtility[] = [
        {
            id: 'trim-whitespace',
            description: 'Trim whitespace from all lines',
            action: () => this.trimAllLines()
        },
        {
            id: 'trim-prefix',
            description: 'Remove first character from each line',
            action: () => this.removeFirstCharacter()
        },
        {
            id: 'split-by-numbered-line',
            description: 'Split by numbered lines (1. 2. 3. etc.)',
            action: () => this.splitByNumberedLine()
        }
    ];

    get splitText(): string[] {
        return this.inputText.split('\n').filter(line => !(line === '\n' || !line));
    }

    openDialog(): void {
        this.inputText = this.inputTextProp;
        this.dialog = true;
    }

    closeDialog(): void {
        this.dialog = false;
    }

    removeFirstCharacter(): void {
        const lines = this.splitText;
        const processedLines = lines.map(line => line.substring(1));
        this.inputText = processedLines.join('\n');
    }

    splitByNumberedLine(): void {
        const numberedLineRegex = /\d+[.):] /gm;
        const matches = this.inputText.match(numberedLineRegex);

        if (matches) {
            matches.forEach((match, idx) => {
                const replaceText = idx === 0 ? '' : '\n';
                this.inputText = this.inputText.replace(match, replaceText);
            });
        }
    }

    trimAllLines(): void {
        const lines = this.splitText;
        const trimmedLines = lines.map(line => line.trim());
        this.inputText = trimmedLines.join('\n');
    }

    save(): void {
        this.bulkData.emit(this.splitText);
        this.closeDialog();
    }
} 