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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
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
        private adminService: AdminService,
        private dialog: MatDialog
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
        this.adminService.getSystemHealth().subscribe({
            next: (health) => {
                this.systemHealth = health;
            },
            error: (error) => {
                console.error('Error loading system health:', error);
                // Set default values on error
                this.systemHealth = {
                    status: 'unknown',
                    uptime: 0,
                    cpuUsage: 0,
                    memoryUsage: 0,
                    diskUsage: 0,
                    services: []
                };
            }
        });
    }

    private loadMaintenanceTasks(): void {
        this.adminService.getMaintenanceTasks().subscribe({
            next: (tasks) => {
                this.maintenanceTasks = tasks;
            },
            error: (error) => {
                console.error('Error loading maintenance tasks:', error);
                this.maintenanceTasks = [];
            }
        });
    }

    onRunTask(task: MaintenanceTask): void {
        this.selectedTask = task;
        this.showConfirmDialog = true;
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
        task.status = 'running';

        // Simulate task execution
        const interval = setInterval(() => {
            this.taskProgress += Math.random() * 20;
            if (this.taskProgress >= 100) {
                this.taskProgress = 100;
                task.status = 'completed';
                task.progress = 100;
                this.runningTask = null;
                clearInterval(interval);
                this.snackBar.open(`Task "${task.name}" completed successfully`, 'Close', { duration: 3000 });
            }
        }, 1000);
    }

    onScheduleTask(task: MaintenanceTask): void {
        const schedule = prompt('Enter cron expression for scheduling (e.g., "0 2 * * *" for daily at 2 AM):');
        if (schedule) {
            this.adminService.runMaintenanceTask(task.id, { schedule }).subscribe({
                next: () => {
                    this.snackBar.open(`Task "${task.name}" scheduled successfully`, 'Close', { duration: 3000 });
                    this.loadMaintenanceTasks();
                },
                error: (error) => {
                    console.error('Error scheduling task:', error);
                    this.snackBar.open(`Failed to schedule task "${task.name}"`, 'Close', { duration: 3000 });
                }
            });
        }
    }

    onViewTaskDetails(task: MaintenanceTask): void {
        // For now, show task details in an alert
        const details = `
Task: ${task.name}
Description: ${task.description}
Type: ${task.type}
Status: ${task.status}
Progress: ${task.progress}%
Estimated Time: ${task.estimatedTime} seconds
Last Run: ${task.lastRun ? new Date(task.lastRun).toLocaleString() : 'Never'}
        `;
        alert(details);
    }

    onEmergencyMaintenance(): void {
        this.showConfirmDialog = true;
        this.selectedTask = {
            id: 'emergency',
            name: 'Emergency Maintenance',
            description: 'Perform emergency system maintenance',
            type: 'repair',
            status: 'pending',
            progress: 0,
            estimatedTime: 300,
            canRun: true,
            requiresConfirmation: true
        } as MaintenanceTask;
    }

    onRefreshHealth(): void {
        this.loadSystemHealth();
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

