import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';

@Component({
    selector: 'app-markdown-editor',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        SafeMarkdownComponent
    ],
    templateUrl: './markdown-editor.component.html',
    styleUrls: ['./markdown-editor.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MarkdownEditorComponent),
            multi: true
        }
    ]
})
export class MarkdownEditorComponent implements ControlValueAccessor {
    @Input() preview = false;
    @Input() showPreview = true;
    @Input() hint = 'Enter markdown content...';

    @Output() previewChange = new EventEmitter<boolean>();

    markdownContent = '';
    activeTab = 0;

    private onChange = (value: string) => { };
    private onTouched = () => { };

    onContentChange(value: string): void {
        this.markdownContent = value;
        this.onChange(value);
    }

    // ControlValueAccessor implementation
    writeValue(value: string): void {
        this.markdownContent = value || '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Implementation for disabled state
    }
} 