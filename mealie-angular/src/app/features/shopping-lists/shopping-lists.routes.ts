import { Routes } from '@angular/router';

export const SHOPPING_LISTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/shopping-lists/shopping-lists.component').then(m => m.ShoppingListsComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./pages/shopping-list-detail/shopping-list-detail.component').then(m => m.ShoppingListDetailComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./pages/shopping-list-create/shopping-list-create.component').then(m => m.ShoppingListCreateComponent)
    }
]; 