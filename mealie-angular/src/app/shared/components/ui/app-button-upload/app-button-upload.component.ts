import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

@Component({
    selector: 'app-button-upload',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        FormsModule
    ],
    templateUrl: './app-button-upload.component.html',
    styleUrls: ['./app-button-upload.component.scss']
})
export class AppButtonUploadComponent {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    @Input() small: boolean = false;
    @Input() post: boolean = true;
    @Input() url: string = '';
    @Input() text: string = '';
    @Input() icon: string | null = null;
    @Input() fileName: string = 'archive';
    @Input() textBtn: boolean = true;
    @Input() accept: string = '';
    @Input() color: string = 'info';
    @Input() disabled: boolean = false;
    @Input() multiple: boolean = false;

    @Output() uploaded = new EventEmitter<File | File[] | any>();

    isSelecting: boolean = false;
    files: File[] = [];

    constructor(private api: ApiService) { }

    get effIcon(): string {
        return this.icon || 'upload';
    }

    get defaultText(): string {
        return 'Upload';
    }

    get displayText(): string {
        return this.text || this.defaultText;
    }

    get buttonVariant(): string {
        return this.textBtn ? 'text' : 'elevated';
    }

    onFileChanged(event: Event): void {
        const target = event.target as HTMLInputElement;

        if (target.files && target.files.length > 0) {
            this.files = Array.from(target.files);
            this.upload();
        }
    }

    async upload(): Promise<void> {
        if (this.files.length === 0) {
            return;
        }

        this.isSelecting = true;

        if (!this.post) {
            // Emit a single File if !multiple, otherwise emit File[]
            this.uploaded.emit(this.multiple ? this.files : this.files[0]);
            this.isSelecting = false;
            return;
        }

        // Multiple file uploads are not supported by the API
        if (this.multiple && this.files.length > 1) {
            console.warn("Multiple file uploads are not supported by the API.");
            return;
        }

        const file = this.files[0];
        const formData = new FormData();
        formData.append(this.fileName, file);

        try {
            this.api.upload<any>(this.url, file).subscribe({
                next: (response) => {
                    this.uploaded.emit(response);
                },
                error: (error) => {
                    console.error('Upload error:', error);
                    this.uploaded.emit(null);
                }
            });
        } catch (e) {
            console.error(e);
            this.uploaded.emit(null);
        }

        this.isSelecting = false;
    }

    onButtonClick(): void {
        this.isSelecting = true;
        window.addEventListener(
            'focus',
            () => {
                this.isSelecting = false;
            },
            { once: true }
        );
        this.fileInput.nativeElement.click();
    }
} 