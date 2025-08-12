import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/recipes', pathMatch: 'full' },
    {
        path: 'recipes',
        loadChildren: () => import('./features/recipes/recipes.routes').then(m => m.RECIPE_ROUTES),
        data: { breadcrumb: 'Recipes' }
    },
    {
        path: 'meal-plans',
        loadChildren: () => import('./features/meal-plans/meal-plans.routes').then(m => m.MEAL_PLANS_ROUTES),
        data: { breadcrumb: 'Meal Plans' }
    },
    {
        path: 'search',
        loadChildren: () => import('./features/search/search.routes').then(m => m.SEARCH_ROUTES),
        data: { breadcrumb: 'Search' }
    },
    {
        path: 'shopping-lists',
        loadChildren: () => import('./features/shopping-lists/shopping-lists.routes').then(m => m.SHOPPING_LISTS_ROUTES),
        data: { breadcrumb: 'Shopping Lists' }
    },
    {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        data: { breadcrumb: 'Settings' }
    },
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        data: { breadcrumb: 'Admin' }
    },
    {
        path: 'group',
        loadChildren: () => import('./features/group/group.routes').then(m => m.GROUP_ROUTES),
        data: { breadcrumb: 'Group' }
    },
    {
        path: 'household',
        loadChildren: () => import('./features/household/household.routes').then(m => m.HOUSEHOLD_ROUTES),
        data: { breadcrumb: 'Household' }
    },
    {
        path: 'user',
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES),
        data: { breadcrumb: 'User' }
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
        data: { breadcrumb: 'Authentication' }
    },
    { path: '**', redirectTo: '/recipes' }
];
