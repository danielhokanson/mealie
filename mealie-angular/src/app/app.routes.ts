import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/recipes', pathMatch: 'full' },
    {
        path: 'recipes',
        loadChildren: () => import('./features/recipes/recipes.routes').then(m => m.RECIPE_ROUTES)
    },
    {
        path: 'search',
        loadChildren: () => import('./features/search/search.routes').then(m => m.SEARCH_ROUTES)
    },
    {
        path: 'shopping-lists',
        loadChildren: () => import('./features/shopping-lists/shopping-lists.routes').then(m => m.SHOPPING_LISTS_ROUTES)
    },
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: 'group',
        loadChildren: () => import('./features/group/group.routes').then(m => m.GROUP_ROUTES)
    },
    {
        path: 'household',
        loadChildren: () => import('./features/household/household.routes').then(m => m.HOUSEHOLD_ROUTES)
    },
    {
        path: 'user',
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    { path: '**', redirectTo: '/recipes' }
];
