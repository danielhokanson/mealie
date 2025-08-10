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

interface MaintenanceTask {
    id: string;
    name: string;
    description: string;
    type: 'cleanup' | 'optimization' | 'repair' | 'backup' | 'update';
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    estimatedTime: number;
    lastRun?: Date;
    nextRun?: Date;
    canRun: boolean;
    requiresConfirmation: boolean;
}

interface SystemHealth {
    database: {
        status: 'healthy' | 'warning' | 'error';
        size: number;
        connections: number;
        performance: number;
    };
    storage: {
        status: 'healthy' | 'warning' | 'error';
        used: number;
        total: number;
        performance: number;
    };
    memory: {
        status: 'healthy' | 'warning' | 'error';
        used: number;
        total: number;
        performance: number;
    };
    cpu: {
        status: 'healthy' | 'warning' | 'error';
        usage: number;
        performance: number;
    };
}

@Component({
    selector: 'app-admin-maintenance',
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
    templateUrl: './admin-maintenance.component.html',
    styleUrls: ['./admin-maintenance.component.scss']
})
export class AdminMaintenanceComponent implements OnInit, OnDestroy {
    loading = false;
    systemHealth: SystemHealth | null = null;
    maintenanceTasks: MaintenanceTask[] = [];
    runningTask: MaintenanceTask | null = null;
    taskProgress = 0;
    showConfirmDialog = false;
    selectedTask: MaintenanceTask | null = null;

    displayedColumns: string[] = ['name', 'type', 'status', 'lastRun', 'actions'];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private adminService: AdminService
    ) { }

    ngOnInit(): void {
        this.loadSystemHealth();
        this.loadMaintenanceTasks();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadSystemHealth(): void {
        this.loading = true;

        this.adminService.getSystemHealth()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (health) => {
                    this.systemHealth = health;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading system health:', error);
                    this.loading = false;
                }
            });

    }

    private loadMaintenanceTasks(): void {
        this.loading = true;

        this.adminService.getMaintenanceTasks()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (tasks) => {
                    this.maintenanceTasks = tasks;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading maintenance tasks:', error);
                    this.maintenanceTasks = [];
                    this.loading = false;
                }
            });
        /*
        setTimeout(() => {
            this.maintenanceTasks = [
                {
                    id: '1',
                    name: 'Database Cleanup',
                    description: 'Remove orphaned records and optimize database performance',
                    type: 'cleanup',
                    status: 'completed',
                    progress: 100,
                    estimatedTime: 300,
                    lastRun: new Date('2024-01-15T10:30:00'),
                    nextRun: new Date('2024-01-22T10:30:00'),
                    canRun: true,
                    requiresConfirmation: false
                },
                {
                    id: '2',
                    name: 'Storage Optimization',
                    description: 'Compress images and remove unused files',
                    type: 'optimization',
                    status: 'pending',
                    progress: 0,
                    estimatedTime: 600,
                    lastRun: new Date('2024-01-14T15:45:00'),
                    nextRun: new Date('2024-01-21T15:45:00'),
                    canRun: true,
                    requiresConfirmation: true
                },
                {
                    id: '3',
                    name: 'System Update Check',
                    description: 'Check for available system updates',
                    type: 'update',
                    status: 'completed',
                    progress: 100,
                    estimatedTime: 60,
                    lastRun: new Date('2024-01-15T08:00:00'),
                    nextRun: new Date('2024-01-16T08:00:00'),
                    canRun: true,
                    requiresConfirmation: false
                },
                {
                    id: '4',
                    name: 'Index Rebuild',
                    description: 'Rebuild database indexes for better performance',
                    type: 'optimization',
                    status: 'pending',
                    progress: 0,
                    estimatedTime: 900,
                    lastRun: new Date('2024-01-13T02:00:00'),
                    nextRun: new Date('2024-01-20T02:00:00'),
                    canRun: true,
                    requiresConfirmation: true
                },
                {
                    id: '5',
                    name: 'Log Cleanup',
                    description: 'Remove old log files and temporary data',
                    type: 'cleanup',
                    status: 'failed',
                    progress: 0,
                    estimatedTime: 120,
                    lastRun: new Date('2024-01-15T12:00:00'),
                    nextRun: new Date('2024-01-16T12:00:00'),
                    canRun: true,
                    requiresConfirmation: false
                }
            ];
            this.loading = false;
        }, 500);
    }

    onRunTask(task: MaintenanceTask): void {
        if (task.requiresConfirmation) {
            this.selectedTask = task;
            this.showConfirmDialog = true;
        } else {
            this.executeTask(task);
        }
    }

    onConfirmTask(): void {
        if (this.selectedTask) {
            this.executeTask(this.selectedTask);
            this.showConfirmDialog = false;
            this.selectedTask = null;
        }
    }

    onCancelTask(): void {
        this.showConfirmDialog = false;
        this.selectedTask = null;
    }

    private executeTask(task: MaintenanceTask): void {
        this.runningTask = task;
        this.taskProgress = 0;
        this.loading = true;

        // Update task status
        const taskIndex = this.maintenanceTasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            this.maintenanceTasks[taskIndex].status = 'running';
        }

        // Simulate task execution
        const interval = setInterval(() => {
            this.taskProgress += 5;
            if (this.taskProgress >= 100) {
                clearInterval(interval);
                this.loading = false;
                this.taskProgress = 0;

                // Update task status
                if (taskIndex !== -1) {
                    this.maintenanceTasks[taskIndex].status = 'completed';
                    this.maintenanceTasks[taskIndex].progress = 100;
                    this.maintenanceTasks[taskIndex].lastRun = new Date();
                }

                this.runningTask = null;
                this.snackBar.open(`${task.name} completed successfully`, 'Close', { duration: 3000 });
            }
        }, task.estimatedTime * 10); // Simulate progress based on estimated time
    }

    onScheduleTask(task: MaintenanceTask): void {
        // TODO: Implement task scheduling
        this.snackBar.open(`${task.name} scheduled for next run`, 'Close', { duration: 3000 });
    }

    onViewTaskDetails(task: MaintenanceTask): void {
        // TODO: Implement task details view
        this.snackBar.open(`Viewing details for ${task.name}`, 'Close', { duration: 2000 });
    }

    onEmergencyMaintenance(): void {
        if (confirm('Are you sure you want to run emergency maintenance? This may temporarily affect system performance.')) {
            this.loading = true;

            // TODO: Implement emergency maintenance
            setTimeout(() => {
                this.loading = false;
                this.snackBar.open('Emergency maintenance completed', 'Close', { duration: 3000 });
            }, 2000);
        }
    }

    onRefreshHealth(): void {
        this.loadSystemHealth();
        this.snackBar.open('System health refreshed', 'Close', { duration: 2000 });
    }

    getHealthStatusColor(status: string | undefined): string {
        switch (status) {
            case 'healthy':
                return '#4caf50';
            case 'warning':
                return '#ff9800';
            case 'error':
                return '#f44336';
            default:
                return '#666';
        }
    }

    getHealthStatusIcon(status: string | undefined): string {
        switch (status) {
            case 'healthy':
                return 'check_circle';
            case 'warning':
                return 'warning';
            case 'error':
                return 'error';
            default:
                return 'info';
        }
    }

    getTaskTypeColor(type: string): string {
        switch (type) {
            case 'cleanup':
                return '#2196f3';
            case 'optimization':
                return '#4caf50';
            case 'repair':
                return '#ff9800';
            case 'backup':
                return '#9c27b0';
            case 'update':
                return '#607d8b';
            default:
                return '#666';
        }
    }

    getTaskTypeIcon(type: string): string {
        switch (type) {
            case 'cleanup':
                return 'cleaning_services';
            case 'optimization':
                return 'speed';
            case 'repair':
                return 'build';
            case 'backup':
                return 'backup';
            case 'update':
                return 'system_update';
            default:
                return 'settings';
        }
    }

    getTaskStatusColor(status: string): string {
        switch (status) {
            case 'completed':
                return '#4caf50';
            case 'running':
                return '#2196f3';
            case 'pending':
                return '#ff9800';
            case 'failed':
                return '#f44336';
            default:
                return '#666';
        }
    }

    getTaskStatusIcon(status: string): string {
        switch (status) {
            case 'completed':
                return 'check_circle';
            case 'running':
                return 'pending';
            case 'pending':
                return 'schedule';
            case 'failed':
                return 'error';
            default:
                return 'info';
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

    getFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getStoragePercentage(): number {
        if (this.systemHealth) {
            return Math.round((this.systemHealth.storage.used / this.systemHealth.storage.total) * 100);
        }
        return 0;
    }

    getMemoryPercentage(): number {
        if (this.systemHealth) {
            return Math.round((this.systemHealth.memory.used / this.systemHealth.memory.total) * 100);
        }
        return 0;
    }

    getEstimatedTimeDisplay(seconds: number): string {
        if (seconds < 60) {
            return `${seconds} seconds`;
        } else if (seconds < 3600) {
            return `${Math.round(seconds / 60)} minutes`;
        } else {
            return `${Math.round(seconds / 3600)} hours`;
        }
    }

    canRunTask(task: MaintenanceTask): boolean {
        return task.canRun && task.status !== 'running';
    }

    isSystemHealthy(): boolean {
        if (!this.systemHealth) return false;
        return this.systemHealth.database.status === 'healthy' &&
            this.systemHealth.storage.status === 'healthy' &&
            this.systemHealth.memory.status === 'healthy' &&
            this.systemHealth.cpu.status === 'healthy';
    }

    getOverallHealthStatus(): string {
        if (this.isSystemHealthy()) {
            return 'healthy';
        } else if (this.systemHealth?.database.status === 'error' ||
            this.systemHealth?.storage.status === 'error' ||
            this.systemHealth?.memory.status === 'error' ||
            this.systemHealth?.cpu.status === 'error') {
            return 'error';
        } else {
            return 'warning';
        }
    }
} 