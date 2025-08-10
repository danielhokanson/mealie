import { Routes } from '@angular/router';

export const GROUP_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/group-dashboard/group-dashboard.component').then(m => m.GroupDashboardComponent)
    }
]; 