import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface DropZoneConfig {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    autoUpload?: boolean;
}

@Component({
    selector: 'app-drop-zone',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressBarModule
    ],
    templateUrl: './drop-zone.component.html',
    styleUrls: ['./drop-zone.component.scss']
})
export class DropZoneComponent {
    @Input() config: DropZoneConfig = {
        accept: '*/*',
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
        autoUpload: true
    };
    @Input() disabled: boolean = false;
    @Input() text: string = 'Drop files here or click to browse';

    @Output() filesSelected = new EventEmitter<File[]>();
    @Output() fileUploaded = new EventEmitter<File>();
    @Output() uploadError = new EventEmitter<string>();

    isDragOver: boolean = false;
    isUploading: boolean = false;
    uploadProgress: number = 0;
    selectedFiles: File[] = [];

    @HostListener('dragover', ['$event'])
    onDragOver(event: DragEvent): void {
        if (this.disabled) return;

        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: DragEvent): void {
        if (this.disabled) return;

        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent): void {
        if (this.disabled) return;

        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        const files = Array.from(event.dataTransfer?.files || []);
        this.handleFiles(files);
    }

    onFileInputChange(event: Event): void {
        if (this.disabled) return;

        const target = event.target as HTMLInputElement;
        const files = Array.from(target.files || []);
        this.handleFiles(files);
    }

    private handleFiles(files: File[]): void {
        if (files.length === 0) return;

        // Filter files based on accept type
        const filteredFiles = files.filter(file => {
            if (!this.config.accept || this.config.accept === '*/*') {
                return true;
            }

            const acceptTypes = this.config.accept.split(',').map(type => type.trim());
            return acceptTypes.some(type => {
                if (type.endsWith('/*')) {
                    const baseType = type.slice(0, -2);
                    return file.type.startsWith(baseType);
                }
                return file.type === type;
            });
        });

        // Check file sizes
        const validFiles = filteredFiles.filter(file => {
            if (file.size > this.config.maxSize!) {
                this.uploadError.emit(`File ${file.name} is too large. Maximum size is ${this.formatFileSize(this.config.maxSize!)}`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Limit to single file if multiple is false
        const finalFiles = this.config.multiple ? validFiles : [validFiles[0]];

        this.selectedFiles = finalFiles;
        this.filesSelected.emit(finalFiles);

        if (this.config.autoUpload) {
            this.uploadFiles(finalFiles);
        }
    }

    private async uploadFiles(files: File[]): Promise<void> {
        this.isUploading = true;
        this.uploadProgress = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                await this.uploadFile(file);
                this.uploadProgress = ((i + 1) / files.length) * 100;
            } catch (error) {
                this.uploadError.emit(`Failed to upload ${file.name}: ${error}`);
            }
        }

        this.isUploading = false;
        this.uploadProgress = 0;
    }

    private async uploadFile(file: File): Promise<void> {
        // Simulate file upload
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.fileUploaded.emit(file);
                resolve();
            }, 1000);
        });
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    onBrowseClick(): void {
        if (this.disabled) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = this.config.accept || '*/*';
        input.multiple = this.config.multiple || false;
        input.onchange = (event) => this.onFileInputChange(event);
        input.click();
    }

    clearFiles(): void {
        this.selectedFiles = [];
        this.uploadProgress = 0;
        this.isUploading = false;
    }
} 