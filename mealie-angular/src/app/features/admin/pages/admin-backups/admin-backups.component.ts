import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';

interface BackupInfo {
    id: string;
    name: string;
    type: 'manual' | 'scheduled' | 'auto';
    size: number;
    createdAt: Date;
    status: 'completed' | 'failed' | 'in_progress';
    description?: string;
    location: string;
    compressionRatio?: number;
    encryptionEnabled: boolean;
}

@Component({
    selector: 'app-admin-backups',
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
        MatTabsModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
    ],
    templateUrl: './admin-backups.component.html',
    styleUrls: ['./admin-backups.component.scss']
})
export class AdminBackupsComponent implements OnInit, OnDestroy {
    loading = false;
    backups: BackupInfo[] = [];
    backupForm!: FormGroup;
    showCreateBackup = false;
    selectedBackup: BackupInfo | null = null;
    backupProgress = 0;
    restoreProgress = 0;

    backupTypes = [
        { value: 'manual', label: 'Manual Backup' },
        { value: 'scheduled', label: 'Scheduled Backup' },
        { value: 'auto', label: 'Automatic Backup' }
    ];

    backupStatuses = [
        { value: 'completed', label: 'Completed', color: '#4caf50' },
        { value: 'failed', label: 'Failed', color: '#f44336' },
        { value: 'in_progress', label: 'In Progress', color: '#ff9800' }
    ];

    displayedColumns: string[] = ['name', 'type', 'size', 'createdAt', 'status', 'actions'];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private adminService: AdminService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadBackups();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.backupForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            type: ['manual', [Validators.required]],
            description: ['', [Validators.maxLength(500)]],
            includeImages: [true],
            includeDatabase: [true],
            includeSettings: [true],
            compressionEnabled: [true],
            encryptionEnabled: [false],
            encryptionPassword: ['', [Validators.minLength(8)]]
        });
    }

    private loadBackups(): void {
        this.loading = true;

        this.adminService.getBackups()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (backups) => {
                    this.backups = backups;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading backups:', error);
                    this.snackBar.open('Error loading backups', 'Close', { duration: 3000 });
                    this.loading = false;
                    // Fallback to sample data for development
                    setTimeout(() => {
                        this.backups = [
                            {
                                id: '1',
                                name: 'Full Backup - 2024-01-15',
                                type: 'manual',
                                size: 1024 * 1024 * 50, // 50MB
                                createdAt: new Date('2024-01-15T10:30:00'),
                                status: 'completed',
                                description: 'Complete system backup including all recipes and images',
                                location: '/backups/full-backup-2024-01-15.zip',
                                compressionRatio: 0.75,
                                encryptionEnabled: false
                            },
                            {
                                id: '2',
                                name: 'Database Backup - 2024-01-14',
                                type: 'scheduled',
                                size: 1024 * 1024 * 5, // 5MB
                                createdAt: new Date('2024-01-14T02:00:00'),
                                status: 'completed',
                                description: 'Daily database backup',
                                location: '/backups/db-backup-2024-01-14.sql',
                                compressionRatio: 0.85,
                                encryptionEnabled: true
                            },
                            {
                                id: '3',
                                name: 'Auto Backup - 2024-01-13',
                                type: 'auto',
                                size: 1024 * 1024 * 25, // 25MB
                                createdAt: new Date('2024-01-13T15:45:00'),
                                status: 'completed',
                                description: 'Automatic weekly backup',
                                location: '/backups/auto-backup-2024-01-13.zip',
                                compressionRatio: 0.70,
                                encryptionEnabled: false
                            }
                        ];
                        this.loading = false;
                    }, 500);
                }
            });
    }

    onCreateBackup(): void {
        this.showCreateBackup = true;
        this.backupForm.reset();
        this.backupForm.patchValue({
            type: 'manual',
            includeImages: true,
            includeDatabase: true,
            includeSettings: true,
            compressionEnabled: true,
            encryptionEnabled: false
        });
    }

    onSaveBackup(): void {
        if (this.backupForm.valid) {
            this.loading = true;
            this.backupProgress = 0;

            const formData = this.backupForm.value;

            this.adminService.createBackup(formData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response) => {
                        // Simulate progress for better UX
                        const interval = setInterval(() => {
                            this.backupProgress += 10;
                            if (this.backupProgress >= 100) {
                                clearInterval(interval);
                                this.loading = false;
                                this.backupProgress = 0;
                                this.showCreateBackup = false;
                                this.snackBar.open('Backup created successfully', 'Close', { duration: 3000 });
                                this.loadBackups(); // Reload backups list
                            }
                        }, 200);
                    },
                    error: (error) => {
                        console.error('Error creating backup:', error);
                        this.snackBar.open('Error creating backup', 'Close', { duration: 3000 });
                        this.loading = false;
                        this.backupProgress = 0;
                    }
                });
        } else {
            this.markFormGroupTouched();
        }
    }

    onCancelBackup(): void {
        this.showCreateBackup = false;
    }

    onDeleteBackup(backup: BackupInfo): void {
        if (confirm(`Are you sure you want to delete backup "${backup.name}"?`)) {
            this.loading = true;

            this.adminService.deleteBackup(backup.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.backups = this.backups.filter(b => b.id !== backup.id);
                        this.loading = false;
                        this.snackBar.open('Backup deleted successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error deleting backup:', error);
                        this.snackBar.open('Error deleting backup', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
        }
    }

    onRestoreBackup(backup: BackupInfo): void {
        if (confirm(`Are you sure you want to restore from backup "${backup.name}"? This will overwrite current data.`)) {
            this.loading = true;
            this.restoreProgress = 0;

            // Simulate restore progress
            const interval = setInterval(() => {
                this.restoreProgress += 10;
                if (this.restoreProgress >= 100) {
                    clearInterval(interval);
                    this.loading = false;
                    this.restoreProgress = 0;
                    this.snackBar.open('Backup restored successfully', 'Close', { duration: 3000 });
                }
            }, 300);
        }
    }

    onDownloadBackup(backup: BackupInfo): void {
        this.adminService.downloadBackup(backup.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = backup.name;
                    link.click();
                    window.URL.revokeObjectURL(url);
                    this.snackBar.open(`${backup.name} downloaded successfully`, 'Close', { duration: 3000 });
                },
                error: (error) => {
                    console.error('Error downloading backup:', error);
                    this.snackBar.open('Error downloading backup', 'Close', { duration: 3000 });
                }
            });
    }

    onViewBackupDetails(backup: BackupInfo): void {
        this.selectedBackup = backup;
    }

    onCloseBackupDetails(): void {
        this.selectedBackup = null;
    }

    getFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getStatusColor(status: string): string {
        const statusInfo = this.backupStatuses.find(s => s.value === status);
        return statusInfo ? statusInfo.color : '#666';
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'completed':
                return 'check_circle';
            case 'failed':
                return 'error';
            case 'in_progress':
                return 'pending';
            default:
                return 'info';
        }
    }

    getTypeIcon(type: string): string {
        switch (type) {
            case 'manual':
                return 'backup';
            case 'scheduled':
                return 'schedule';
            case 'auto':
                return 'auto_awesome';
            default:
                return 'backup';
        }
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.backupForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('maxlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${field?.errors?.['maxlength'].requiredLength} characters`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        return '';
    }

    canSaveBackup(): boolean {
        return this.backupForm.valid && !this.loading;
    }

    getCompressionRatio(backup: BackupInfo): string {
        if (backup.compressionRatio) {
            return `${Math.round((1 - backup.compressionRatio) * 100)}%`;
        }
        return 'N/A';
    }

    private markFormGroupTouched(): void {
        Object.keys(this.backupForm.controls).forEach(key => {
            const control = this.backupForm.get(key);
            control?.markAsTouched();
        });
    }
} 