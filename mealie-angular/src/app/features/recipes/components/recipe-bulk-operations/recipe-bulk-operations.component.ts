import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Recipe, RecipeCategory, RecipeTag } from '../../../../core/models/recipe.model';
import { RecipeService } from '../../../../core/services/recipe.service';

@Component({
    selector: 'app-recipe-bulk-operations',
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
        MatDialogModule,
        MatChipsModule,
        MatListModule,
        MatDividerModule,
        MatMenuModule,
        MatTooltipModule,
        MatExpansionModule
    ],
    templateUrl: './recipe-bulk-operations.component.html',
    styleUrls: ['./recipe-bulk-operations.component.scss']
})
export class RecipeBulkOperationsComponent implements OnInit, OnDestroy {
    @Input() selectedRecipes: Recipe[] = [];
    @Input() availableCategories: RecipeCategory[] = [];
    @Input() availableTags: RecipeTag[] = [];
    @Output() operationComplete = new EventEmitter<void>();
    @Output() selectionChange = new EventEmitter<Recipe[]>();
    @Output() selectAll = new EventEmitter<void>();
    @Output() invertSelection = new EventEmitter<void>();

    loading = false;
    operationType: 'category' | 'tag' | 'delete' | 'export' | 'share' = 'category';
    bulkForm: FormGroup;
    selectedCategories: string[] = [];
    selectedTags: string[] = [];
    confirmDelete = false;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private recipeService: RecipeService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.updateForm();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.bulkForm = this.fb.group({
            operationType: ['category', [Validators.required]],
            categories: [[]],
            tags: [[]],
            confirmDelete: [false]
        });
    }

    private updateForm(): void {
        this.bulkForm.patchValue({
            operationType: this.operationType,
            categories: this.selectedCategories,
            tags: this.selectedTags,
            confirmDelete: this.confirmDelete
        });
    }

    onOperationTypeChange(type: 'category' | 'tag' | 'delete' | 'export' | 'share'): void {
        this.operationType = type;
        this.bulkForm.patchValue({ operationType: type });
    }

    onCategoryToggle(categoryId: string): void {
        const index = this.selectedCategories.indexOf(categoryId);
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            this.selectedCategories.push(categoryId);
        }
        this.bulkForm.patchValue({ categories: this.selectedCategories });
    }

    onTagToggle(tagId: string): void {
        const index = this.selectedTags.indexOf(tagId);
        if (index > -1) {
            this.selectedTags.splice(index, 1);
        } else {
            this.selectedTags.push(tagId);
        }
        this.bulkForm.patchValue({ tags: this.selectedTags });
    }

    onConfirmDeleteChange(): void {
        this.confirmDelete = !this.confirmDelete;
        this.bulkForm.patchValue({ confirmDelete: this.confirmDelete });
    }

    onExecuteOperation(): void {
        if (this.bulkForm.valid && this.selectedRecipes.length > 0) {
            this.loading = true;

            switch (this.operationType) {
                case 'category':
                    this.executeCategoryOperation();
                    break;
                case 'tag':
                    this.executeTagOperation();
                    break;
                case 'delete':
                    this.executeDeleteOperation();
                    break;
                case 'export':
                    this.executeExportOperation();
                    break;
                case 'share':
                    this.executeShareOperation();
                    break;
            }
        }
    }

    private executeCategoryOperation(): void {
        const recipeIds = this.selectedRecipes.map(r => r.id);
        const operations = [];

        if (this.selectedCategories.length > 0) {
            for (const categoryId of this.selectedCategories) {
                operations.push(this.recipeService.bulkAddCategory(recipeIds, categoryId));
            }
        }

        if (operations.length > 0) {
            forkJoin(operations)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loading = false;
                        this.snackBar.open(`Updated categories for ${this.selectedRecipes.length} recipes`, 'Close', { duration: 3000 });
                        this.operationComplete.emit();
                    },
                    error: (error) => {
                        console.error('Error updating categories:', error);
                        this.snackBar.open('Error updating categories', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
        } else {
            this.loading = false;
            this.snackBar.open('No categories selected', 'Close', { duration: 2000 });
        }
    }

    private executeTagOperation(): void {
        const recipeIds = this.selectedRecipes.map(r => r.id);
        const operations = [];

        if (this.selectedTags.length > 0) {
            for (const tagId of this.selectedTags) {
                operations.push(this.recipeService.bulkAddTag(recipeIds, tagId));
            }
        }

        if (operations.length > 0) {
            forkJoin(operations)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loading = false;
                        this.snackBar.open(`Updated tags for ${this.selectedRecipes.length} recipes`, 'Close', { duration: 3000 });
                        this.operationComplete.emit();
                    },
                    error: (error) => {
                        console.error('Error updating tags:', error);
                        this.snackBar.open('Error updating tags', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
        } else {
            this.loading = false;
            this.snackBar.open('No tags selected', 'Close', { duration: 2000 });
        }
    }

    private executeDeleteOperation(): void {
        if (!this.confirmDelete) {
            this.snackBar.open('Please confirm deletion', 'Close', { duration: 2000 });
            return;
        }

        const recipeIds = this.selectedRecipes.map(r => r.id);

        this.recipeService.bulkDeleteRecipes(recipeIds)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.snackBar.open(`Deleted ${this.selectedRecipes.length} recipes`, 'Close', { duration: 3000 });
                    this.operationComplete.emit();
                },
                error: (error) => {
                    console.error('Error deleting recipes:', error);
                    this.snackBar.open('Error deleting recipes', 'Close', { duration: 3000 });
                    this.loading = false;
                }
            });
    }

    private executeExportOperation(): void {
        const recipeIds = this.selectedRecipes.map(r => r.id);

        this.recipeService.bulkExportRecipes(recipeIds, 'json')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `recipes-export-${new Date().toISOString().split('T')[0]}.zip`;
                    link.click();
                    window.URL.revokeObjectURL(url);

                    this.loading = false;
                    this.snackBar.open(`Exported ${this.selectedRecipes.length} recipes`, 'Close', { duration: 3000 });
                    this.operationComplete.emit();
                },
                error: (error) => {
                    console.error('Error exporting recipes:', error);
                    this.snackBar.open('Error exporting recipes', 'Close', { duration: 3000 });
                    this.loading = false;
                }
            });
    }

    private executeShareOperation(): void {
        // For now, generate share URLs for each recipe
        const shareUrls = this.selectedRecipes.map(recipe =>
            `${window.location.origin}/recipes/${recipe.slug}`
        );

        // Copy URLs to clipboard
        const urlsText = shareUrls.join('\n');
        navigator.clipboard.writeText(urlsText).then(() => {
            this.loading = false;
            this.snackBar.open(`Shared URLs for ${this.selectedRecipes.length} recipes copied to clipboard`, 'Close', { duration: 3000 });
            this.operationComplete.emit();
        }).catch(() => {
            this.loading = false;
            this.snackBar.open('Error copying share URLs', 'Close', { duration: 3000 });
        });
    }

    onClearSelection(): void {
        this.selectedRecipes = [];
        this.selectionChange.emit(this.selectedRecipes);
    }

    onSelectAll(): void {
        // This would need to be implemented by the parent component
        // as it has access to all available recipes
        this.selectAll.emit();
    }

    onInvertSelection(): void {
        // This would need to be implemented by the parent component
        // as it has access to all available recipes
        this.invertSelection.emit();
    }

    getSelectedCategoryNames(): string[] {
        return this.availableCategories
            .filter(cat => this.selectedCategories.includes(cat.id))
            .map(cat => cat.name);
    }

    getSelectedTagNames(): string[] {
        return this.availableTags
            .filter(tag => this.selectedTags.includes(tag.id))
            .map(tag => tag.name);
    }

    isCategorySelected(categoryId: string): boolean {
        return this.selectedCategories.includes(categoryId);
    }

    isTagSelected(tagId: string): boolean {
        return this.selectedTags.includes(tagId);
    }

    getCategoryColor(category: RecipeCategory): string {
        return category.color || '#666';
    }

    getTagColor(tag: RecipeTag): string {
        return tag.color || '#666';
    }

    getOperationButtonText(): string {
        switch (this.operationType) {
            case 'category':
                return `Update Categories (${this.selectedRecipes.length})`;
            case 'tag':
                return `Update Tags (${this.selectedRecipes.length})`;
            case 'delete':
                return `Delete Recipes (${this.selectedRecipes.length})`;
            case 'export':
                return `Export Recipes (${this.selectedRecipes.length})`;
            case 'share':
                return `Share Recipes (${this.selectedRecipes.length})`;
            default:
                return 'Execute Operation';
        }
    }
} 