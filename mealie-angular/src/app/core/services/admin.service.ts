import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private api: ApiService) { }

    /**
     * Get system statistics
     */
    getSystemStatistics(): Observable<any> {
        return this.api.get<any>('/admin/statistics');
    }

    /**
     * Get system health check
     */
    getSystemHealth(): Observable<any> {
        return this.api.get<any>('/admin/system/health');
    }

    /**
     * Get recent activity
     */
    getRecentActivity(limit = 10): Observable<any[]> {
        return this.api.get<any[]>('/admin/activity', { limit });
    }

    /**
     * Get site settings
     */
    getSiteSettings(): Observable<any> {
        return this.api.get<any>('/admin/settings');
    }

    /**
     * Update site settings
     */
    updateSiteSettings(settings: any): Observable<any> {
        return this.api.put<any>('/admin/settings', settings);
    }

    /**
     * Get all backups
     */
    getBackups(): Observable<any[]> {
        return this.api.get<any[]>('/admin/backups');
    }

    /**
     * Create backup
     */
    createBackup(options: any = {}): Observable<any> {
        return this.api.post<any>('/admin/backups', options);
    }

    /**
     * Delete backup
     */
    deleteBackup(backupId: string): Observable<void> {
        return this.api.delete<void>(`/admin/backups/${backupId}`);
    }

    /**
     * Download backup
     */
    downloadBackup(backupId: string): Observable<Blob> {
        return this.api.get<Blob>(`/admin/backups/${backupId}/download`);
    }

    /**
     * Restore backup
     */
    restoreBackup(backupId: string): Observable<any> {
        return this.api.post<any>(`/admin/backups/${backupId}/restore`, {});
    }

    /**
     * Run maintenance task
     */
    runMaintenanceTask(taskName: string, options: any = {}): Observable<any> {
        return this.api.post<any>(`/admin/maintenance/${taskName}`, options);
    }

    /**
     * Get maintenance tasks status
     */
    getMaintenanceTasks(): Observable<any[]> {
        return this.api.get<any[]>('/admin/maintenance/tasks');
    }

    /**
     * Clean up system
     */
    cleanupSystem(): Observable<any> {
        return this.api.post<any>('/admin/maintenance/cleanup', {});
    }

    /**
     * Get logs
     */
    getLogs(lines = 100): Observable<string[]> {
        return this.api.get<string[]>('/admin/logs', { lines });
    }
}