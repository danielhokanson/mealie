import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

import { BaseDialogComponent } from '../../base-dialog/base-dialog.component';
import { RecipeDialogAddToShoppingListComponent } from '../../recipe-dialog-add-to-shopping-list/recipe-dialog-add-to-shopping-list.component';
import { RecipeDialogPrintPreferencesComponent } from '../../recipe-dialog-print-preferences/recipe-dialog-print-preferences.component';
import { RecipeDialogShareComponent } from '../../recipe-dialog-share/recipe-dialog-share.component';
import { Recipe } from '../../../../../core/models/recipe.model';
import { ShoppingList } from '../../../../../core/models/shopping-list.model';

export interface ContextMenuIncludes {
    delete: boolean;
    edit: boolean;
    download: boolean;
    duplicate: boolean;
    mealplanner: boolean;
    shoppingList: boolean;
    print: boolean;
    printPreferences: boolean;
    share: boolean;
    recipeActions: boolean;
}

export interface ContextMenuItem {
    title: string;
    icon: string;
    color: string | undefined;
    event: string;
    isPublic: boolean;
}



export interface GroupRecipeActionOut {
    id: string;
    title: string;
    actionType: string;
    // ... other action properties
}

export type PlanEntryType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PlanTypeOption {
    text: string;
    value: PlanEntryType;
}

@Component({
    selector: 'app-recipe-context-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatListModule,
        MatDividerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        FormsModule,
        BaseDialogComponent,
        RecipeDialogAddToShoppingListComponent,
        RecipeDialogPrintPreferencesComponent,
        RecipeDialogShareComponent
    ],
    templateUrl: './recipe-context-menu.component.html',
    styleUrls: ['./recipe-context-menu.component.scss']
})
export class RecipeContextMenuComponent implements OnInit {
    @Input() useItems: ContextMenuIncludes = {
        delete: true,
        edit: true,
        download: true,
        duplicate: false,
        mealplanner: true,
        shoppingList: true,
        print: true,
        printPreferences: true,
        share: true,
        recipeActions: true
    };
    @Input() appendItems: ContextMenuItem[] = [];
    @Input() leadingItems: ContextMenuItem[] = [];
    @Input() menuTop = true;
    @Input() fab = false;
    @Input() color = 'primary';
    @Input() slug = '';
    @Input() menuIcon: string | null = null;
    @Input() name = '';
    @Input() recipe?: Recipe;
    @Input() recipeId = '';
    @Input() recipeScale = 1;

    @Output() delete = new EventEmitter<string>();
    @Output() edit = new EventEmitter<void>();
    @Output() download = new EventEmitter<void>();
    @Output() duplicate = new EventEmitter<void>();
    @Output() mealplanner = new EventEmitter<void>();
    @Output() shoppingList = new EventEmitter<void>();
    @Output() print = new EventEmitter<void>();
    @Output() printPreferences = new EventEmitter<void>();
    @Output() share = new EventEmitter<void>();

    // Dialog states
    shareDialog = false;
    printPreferencesDialog = false;
    recipeDeleteDialog = false;
    mealplannerDialog = false;
    shoppingListDialog = false;
    recipeDuplicateDialog = false;

    // Form data
    recipeName = '';
    loading = false;
    menuItems: ContextMenuItem[] = [];
    newMealdate = new Date();
    newMealType: PlanEntryType = 'dinner';
    pickerMenu = false;

    // Data
    shoppingLists?: ShoppingList[];
    recipeRef?: Recipe;
    recipeActions?: GroupRecipeActionOut[];

    // Mock user data - in a real app, this would come from auth service
    currentUser = {
        id: 'current-user-id',
        admin: false,
        groupSlug: 'default-group'
    };

    // Meal plan type options - these are standard meal types
    planTypeOptions: PlanTypeOption[] = [
        { text: 'Breakfast', value: 'breakfast' },
        { text: 'Lunch', value: 'lunch' },
        { text: 'Dinner', value: 'dinner' },
        { text: 'Snack', value: 'snack' }
    ];

    get newMealdateString(): string {
        const year = this.newMealdate.getFullYear();
        const month = String(this.newMealdate.getMonth() + 1).padStart(2, '0');
        const day = String(this.newMealdate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    get icon(): string {
        return this.menuIcon || 'more_vert';
    }

    get isAdminAndNotOwner(): boolean {
        return this.currentUser.admin && this.currentUser.id !== this.recipeRef?.userId;
    }

    get canDelete(): boolean {
        return !!(this.currentUser && this.recipeRef &&
            (this.currentUser.admin || this.currentUser.id === this.recipeRef.userId));
    }

    get recipeRefWithScale(): Recipe | undefined {
        if (!this.recipeRef) return undefined;
        const recipeWithScale = { ...this.recipeRef, scale: (this.recipeRef.scale ?? 1) };
        return recipeWithScale as Recipe;
    }

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.recipeName = this.name;
        this.recipeRef = this.recipe;
        this.setupMenuItems();
    }

    private setupMenuItems(): void {
        const defaultItems: { [key: string]: ContextMenuItem } = {
            edit: {
                title: 'Edit',
                icon: 'edit',
                color: undefined,
                event: 'edit',
                isPublic: false
            },
            delete: {
                title: 'Delete',
                icon: 'delete',
                color: undefined,
                event: 'delete',
                isPublic: false
            },
            download: {
                title: 'Download',
                icon: 'download',
                color: undefined,
                event: 'download',
                isPublic: false
            },
            duplicate: {
                title: 'Duplicate',
                icon: 'content_copy',
                color: undefined,
                event: 'duplicate',
                isPublic: false
            },
            mealplanner: {
                title: 'Add to Plan',
                icon: 'calendar_today',
                color: undefined,
                event: 'mealplanner',
                isPublic: false
            },
            shoppingList: {
                title: 'Add to List',
                icon: 'shopping_cart_checkout',
                color: undefined,
                event: 'shoppingList',
                isPublic: false
            },
            print: {
                title: 'Print',
                icon: 'print',
                color: undefined,
                event: 'print',
                isPublic: true
            },
            printPreferences: {
                title: 'Print Preferences',
                icon: 'print_settings',
                color: undefined,
                event: 'printPreferences',
                isPublic: true
            },
            share: {
                title: 'Share',
                icon: 'share',
                color: undefined,
                event: 'share',
                isPublic: false
            }
        };

        // Add leading and appending items
        this.menuItems = [...this.leadingItems, ...this.appendItems];

        // Get default menu items specified in props
        for (const [key, value] of Object.entries(this.useItems)) {
            if (!value) continue;

            // Skip delete if not allowed
            if (key === 'delete' && !this.canDelete) continue;

            const item = defaultItems[key];
            if (item) {
                this.menuItems.push(item);
            }
        }
    }

    async getShoppingLists(): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // const response = await this.shoppingListService.getAll();
            this.shoppingLists = [
                { id: '1', name: 'Grocery List', description: '', groupId: 'current-group-id', isActive: true, createdAt: new Date(), updatedAt: new Date(), items: [] },
                { id: '2', name: 'Weekly Shopping', description: '', groupId: 'current-group-id', isActive: true, createdAt: new Date(), updatedAt: new Date(), items: [] }
            ];
        } catch (error) {
            console.error('Failed to get shopping lists:', error);
        }
    }

    async refreshRecipe(): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // const recipe = await this.recipeService.getOne(this.slug);
            // this.recipeRef = recipe;
        } catch (error) {
            console.error('Failed to refresh recipe:', error);
        }
    }

    async executeRecipeAction(action: GroupRecipeActionOut): Promise<void> {
        if (!this.recipe) return;

        try {
            // In a real app, you'd call the backend API
            // const response = await this.recipeActionService.execute(action, this.recipe, this.recipeScale);
            console.log('Executing recipe action:', action.title);
        } catch (error) {
            console.error('Failed to execute recipe action:', error);
        }
    }

    async deleteRecipe(): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // await this.recipeService.deleteOne(this.slug);
            console.log('Deleting recipe:', this.slug);
            this.router.navigate([`/g/${this.currentUser.groupSlug}`]);
            this.delete.emit(this.slug);
        } catch (error) {
            console.error('Failed to delete recipe:', error);
        }
    }

    async handleDownloadEvent(): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // const token = await this.recipeService.getZipToken(this.slug);
            // const url = this.recipeService.getZipRedirectUrl(this.slug, token);
            console.log('Downloading recipe:', this.slug);
            this.download.emit();
        } catch (error) {
            console.error('Failed to download recipe:', error);
        }
    }

    async addRecipeToPlan(): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // await this.mealPlanService.createOne({
            //   date: this.newMealdateString,
            //   entryType: this.newMealType,
            //   title: '',
            //   text: '',
            //   recipeId: this.recipeId
            // });
            console.log('Adding recipe to meal plan:', this.recipeId);
        } catch (error) {
            console.error('Failed to add recipe to meal plan:', error);
        }
    }

    async duplicateRecipe(): Promise<void> {
        try {
            // In a real app, you'd call the backend API
            // const duplicatedRecipe = await this.recipeService.duplicateOne(this.slug, this.recipeName);
            console.log('Duplicating recipe:', this.slug, this.recipeName);
            // this.router.navigate([`/g/${this.currentUser.groupSlug}/r/${duplicatedRecipe.slug}`]);
        } catch (error) {
            console.error('Failed to duplicate recipe:', error);
        }
    }

    contextMenuEventHandler(eventKey: string): void {
        const eventHandlers: { [key: string]: () => void | Promise<any> } = {
            delete: () => {
                this.recipeDeleteDialog = true;
            },
            edit: () => {
                this.router.navigate([`/g/${this.currentUser.groupSlug}/r/${this.slug}?edit=true`]);
                this.edit.emit();
            },
            download: () => this.handleDownloadEvent(),
            duplicate: () => {
                this.recipeDuplicateDialog = true;
            },
            mealplanner: () => {
                this.mealplannerDialog = true;
            },
            printPreferences: async () => {
                if (!this.recipeRef) {
                    await this.refreshRecipe();
                }
                this.printPreferencesDialog = true;
            },
            shoppingList: async () => {
                const promises: Promise<void>[] = [this.getShoppingLists()];
                if (!this.recipeRef) {
                    promises.push(this.refreshRecipe());
                }

                await Promise.allSettled(promises);
                this.shoppingListDialog = true;
            },
            share: () => {
                this.shareDialog = true;
            }
        };

        const handler = eventHandlers[eventKey];
        if (handler && typeof handler === 'function') {
            handler();
            this.loading = false;
            return;
        }

        // Emit the event for parent component handling
        this.emitEvent(eventKey);
        this.loading = false;
    }

    private emitEvent(eventKey: string): void {
        switch (eventKey) {
            case 'delete':
                this.delete.emit(this.slug);
                break;
            case 'edit':
                this.edit.emit();
                break;
            case 'download':
                this.download.emit();
                break;
            case 'duplicate':
                this.duplicate.emit();
                break;
            case 'mealplanner':
                this.mealplanner.emit();
                break;
            case 'shoppingList':
                this.shoppingList.emit();
                break;
            case 'print':
                this.print.emit();
                break;
            case 'printPreferences':
                this.printPreferences.emit();
                break;
            case 'share':
                this.share.emit();
                break;
        }
    }
} 