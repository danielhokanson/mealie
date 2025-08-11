import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/settings-redirect/settings-redirect.component').then(m => m.SettingsRedirectComponent)
    }
];

