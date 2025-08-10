import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/user-profile/user-profile.component').then(m => m.UserProfileComponent)
    },
    {
        path: 'settings',
        loadComponent: () => import('./pages/user-settings/user-settings.component').then(m => m.UserSettingsComponent)
    }
]; 