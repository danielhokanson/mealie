import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil } from 'rxjs';
import { Recipe } from '../../../../core/models/recipe.model';
import { RecipeService } from '../../../../core/services/recipe.service';

@Component({
    selector: 'app-recipe-import-export',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatDialogModule,
        MatChipsModule,
        MatListModule,
        MatDividerModule,
        MatMenuModule,
        MatTooltipModule,
        MatExpansionModule,
        MatTabsModule
    ],
    templateUrl: './recipe-import-export.component.html',
    styleUrls: ['./recipe-import-export.component.scss']
})
export class RecipeImportExportComponent implements OnInit, OnDestroy {
    @Input() recipe: Recipe | null = null;

    loading = false;
    importForm: FormGroup;
    exportForm: FormGroup;
    selectedFile: File | null = null;
    importProgress = 0;
    exportProgress = 0;
    importResults: any[] = [];
    exportResults: any[] = [];

    supportedFormats = [
        { value: 'json', label: 'JSON', extension: '.json' },
        { value: 'xml', label: 'XML', extension: '.xml' },
        { value: 'csv', label: 'CSV', extension: '.csv' },
        { value: 'pdf', label: 'PDF', extension: '.pdf' },
        { value: 'docx', label: 'Word Document', extension: '.docx' },
        { value: 'txt', label: 'Plain Text', extension: '.txt' }
    ];

    exportOptions = [
        { value: 'single', label: 'Single Recipe' },
        { value: 'multiple', label: 'Multiple Recipes' },
        { value: 'all', label: 'All Recipes' },
        { value: 'category', label: 'By Category' },
        { value: 'tag', label: 'By Tag' }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private recipeService: RecipeService
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        // Component initialization
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForms(): void {
        this.importForm = this.fb.group({
            file: [null, [Validators.required]],
            format: ['json', [Validators.required]],
            overwrite: [false],
            validateOnly: [false],
            includeImages: [true],
            includeNutrition: [true],
            includeComments: [true]
        });

        this.exportForm = this.fb.group({
            format: ['json', [Validators.required]],
            exportType: ['single', [Validators.required]],
            includeImages: [true],
            includeNutrition: [true],
            includeComments: [true],
            includeMetadata: [true],
            compressOutput: [false]
        });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.importForm.patchValue({ file });

            // Auto-detect format based on file extension
            const extension = file.name.split('.').pop()?.toLowerCase();
            const detectedFormat = this.supportedFormats.find(f => f.extension.includes(extension));
            if (detectedFormat) {
                this.importForm.patchValue({ format: detectedFormat.value });
            }
        }
    }

    onImportRecipes(): void {
        if (this.importForm.valid && this.selectedFile) {
            this.loading = true;
            this.importProgress = 0;

            // Simulate import progress
            const interval = setInterval(() => {
                this.importProgress += 10;
                if (this.importProgress >= 100) {
                    clearInterval(interval);
                    this.loading = false;
                    this.importProgress = 0;

                    // TODO: Implement actual import API call
                    setTimeout(() => {
                        this.importResults = [
                            { name: 'Recipe 1', status: 'success', message: 'Imported successfully' },
                            { name: 'Recipe 2', status: 'warning', message: 'Updated existing recipe' },
                            { name: 'Recipe 3', status: 'error', message: 'Invalid format' }
                        ];
                        this.snackBar.open('Import completed', 'Close', { duration: 3000 });
                    }, 500);
                }
            }, 200);
        }
    }

    onExportRecipes(): void {
        if (this.exportForm.valid) {
            this.loading = true;
            this.exportProgress = 0;

            // Simulate export progress
            const interval = setInterval(() => {
                this.exportProgress += 10;
                if (this.exportProgress >= 100) {
                    clearInterval(interval);
                    this.loading = false;
                    this.exportProgress = 0;

                    // TODO: Implement actual export API call
                    setTimeout(() => {
                        this.exportResults = [
                            { name: 'Recipe 1', status: 'success', message: 'Exported successfully' },
                            { name: 'Recipe 2', status: 'success', message: 'Exported successfully' },
                            { name: 'Recipe 3', status: 'success', message: 'Exported successfully' }
                        ];
                        this.snackBar.open('Export completed', 'Close', { duration: 3000 });
                    }, 500);
                }
            }, 200);
        }
    }

    onCancelImport(): void {
        this.importForm.reset();
        this.selectedFile = null;
        this.importProgress = 0;
        this.importResults = [];
    }

    onCancelExport(): void {
        this.exportForm.reset();
        this.exportProgress = 0;
        this.exportResults = [];
    }

    onDownloadTemplate(format: string): void {
        // TODO: Implement template download
        this.snackBar.open(`Downloading ${format.toUpperCase()} template...`, 'Close', { duration: 2000 });
    }

    onValidateFile(): void {
        if (this.selectedFile) {
            this.loading = true;

            // TODO: Implement file validation
            setTimeout(() => {
                this.loading = false;
                this.snackBar.open('File validation completed', 'Close', { duration: 3000 });
            }, 1000);
        }
    }

    getFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'success':
                return '#4caf50';
            case 'warning':
                return '#ff9800';
            case 'error':
                return '#f44336';
            default:
                return '#666';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'success':
                return 'check_circle';
            case 'warning':
                return 'warning';
            case 'error':
                return 'error';
            default:
                return 'info';
        }
    }

    getErrorMessage(fieldName: string): string {
        const field = this.importForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        return '';
    }

    getExportErrorMessage(fieldName: string): string {
        const field = this.exportForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        return '';
    }

    canImport(): boolean {
        return this.importForm.valid && this.selectedFile !== null;
    }

    canExport(): boolean {
        return this.exportForm.valid;
    }

    getSupportedExtensions(): string {
        return this.supportedFormats.map(f => f.extension).join(', ');
    }

    getFileTypeDescription(format: string): string {
        const formatInfo = this.supportedFormats.find(f => f.value === format);
        return formatInfo ? formatInfo.label : format.toUpperCase();
    }
} 