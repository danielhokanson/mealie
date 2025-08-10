import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    },
    {
        path: 'setup',
        loadComponent: () => import('./pages/admin-setup/admin-setup.component').then(m => m.AdminSetupComponent)
    },
    {
        path: 'backups',
        loadComponent: () => import('./pages/admin-backups/admin-backups.component').then(m => m.AdminBackupsComponent)
    },
    {
        path: 'site-settings',
        loadComponent: () => import('./pages/admin-site-settings/admin-site-settings.component').then(m => m.AdminSiteSettingsComponent)
    },
    {
        path: 'maintenance',
        loadComponent: () => import('./pages/admin-maintenance/admin-maintenance.component').then(m => m.AdminMaintenanceComponent)
    },
    {
        path: 'manage',
        loadComponent: () => import('./pages/admin-manage/admin-manage.component').then(m => m.AdminManageComponent)
    }
]; 