import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { RecipeService } from '../../../../core/services/recipe.service';
import { Recipe, RecipeIngredient, RecipeInstruction, RecipeCategory, RecipeTag, RecipeTool, RecipeFood } from '../../../../core/models/recipe.model';

@Component({
    selector: 'app-recipe-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatSliderModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatDividerModule,
        MatListModule,
        MatExpansionModule,
        MatMenuModule,
        MatTooltipModule
    ],
    templateUrl: './recipe-create.component.html',
    styleUrls: ['./recipe-create.component.scss']
})
export class RecipeCreateComponent implements OnInit, OnDestroy {
    recipeForm!: FormGroup;
    loading = false;
    selectedTab = 0;
    categories: RecipeCategory[] = [];
    tags: RecipeTag[] = [];
    tools: RecipeTool[] = [];
    foods: RecipeFood[] = [];
    selectedCategories: string[] = [];
    selectedTags: string[] = [];
    selectedTools: string[] = [];
    selectedFoods: string[] = [];

    // Add new item flags
    showAddCategory = false;
    showAddTag = false;
    showAddTool = false;
    showAddFood = false;

    // New item models
    newCategory = { name: '', color: '#ff9800' };
    newTag = { name: '', color: '#4caf50' };
    newTool = { name: '' };
    newFood = { name: '' };

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private recipeService: RecipeService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadFormData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.recipeForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            prepTime: [0, [Validators.required, Validators.min(0)]],
            cookTime: [0, [Validators.required, Validators.min(0)]],
            servings: [1, [Validators.required, Validators.min(1)]],
            yield: [''],
            ingredients: this.fb.array([]),
            instructions: this.fb.array([]),
            image: ['']
        });

        // Add initial ingredient and instruction
        this.addIngredient();
        this.addInstruction();
    }

    private loadFormData(): void {
        // Load categories
        this.recipeService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
            next: (categories) => {
                this.categories = categories;
            },
            error: (error) => {
                console.error('Error loading categories:', error);
            }
        });

        // Load tags
        this.recipeService.getTags().pipe(takeUntil(this.destroy$)).subscribe({
            next: (tags) => {
                this.tags = tags;
            },
            error: (error) => {
                console.error('Error loading tags:', error);
            }
        });

        // Load tools
        this.recipeService.getTools().pipe(takeUntil(this.destroy$)).subscribe({
            next: (tools) => {
                this.tools = tools;
            },
            error: (error) => {
                console.error('Error loading tools:', error);
            }
        });

        // Load foods
        this.recipeService.getFoods().pipe(takeUntil(this.destroy$)).subscribe({
            next: (foods) => {
                this.foods = foods;
            },
            error: (error) => {
                console.error('Error loading foods:', error);
            }
        });
    }

    // Form getters
    get ingredients() {
        return this.recipeForm.get('ingredients') as FormArray;
    }

    get instructions() {
        return this.recipeForm.get('instructions') as FormArray;
    }

    // Category management
    onCategoryToggle(categoryId: string): void {
        const index = this.selectedCategories.indexOf(categoryId);
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            this.selectedCategories.push(categoryId);
        }
    }

    addNewCategory(): void {
        if (!this.newCategory.name.trim()) {
            this.snackBar.open('Category name is required', 'Close', { duration: 3000 });
            return;
        }

        const category: RecipeCategory = {
            id: Date.now().toString(), // Temporary ID
            name: this.newCategory.name.trim(),
            color: this.newCategory.color,
            slug: this.newCategory.name.toLowerCase().replace(/\s+/g, '-')
        };

        this.categories.push(category);
        this.selectedCategories.push(category.id);
        this.newCategory = { name: '', color: '#ff9800' };
        this.showAddCategory = false;

        this.snackBar.open('Category added successfully', 'Close', { duration: 3000 });
    }

    // Tag management
    onTagToggle(tagId: string): void {
        const index = this.selectedTags.indexOf(tagId);
        if (index > -1) {
            this.selectedTags.splice(index, 1);
        } else {
            this.selectedTags.push(tagId);
        }
    }

    addNewTag(): void {
        if (!this.newTag.name.trim()) {
            this.snackBar.open('Tag name is required', 'Close', { duration: 3000 });
            return;
        }

        const tag: RecipeTag = {
            id: Date.now().toString(), // Temporary ID
            name: this.newTag.name.trim(),
            color: this.newTag.color,
            slug: this.newTag.name.toLowerCase().replace(/\s+/g, '-')
        };

        this.tags.push(tag);
        this.selectedTags.push(tag.id);
        this.newTag = { name: '', color: '#4caf50' };
        this.showAddTag = false;

        this.snackBar.open('Tag added successfully', 'Close', { duration: 3000 });
    }

    // Tool management
    onToolToggle(toolId: string): void {
        const index = this.selectedTools.indexOf(toolId);
        if (index > -1) {
            this.selectedTools.splice(index, 1);
        } else {
            this.selectedTools.push(toolId);
        }
    }

    addNewTool(): void {
        if (!this.newTool.name.trim()) {
            this.snackBar.open('Tool name is required', 'Close', { duration: 3000 });
            return;
        }

        const tool: RecipeTool = {
            id: Date.now().toString(), // Temporary ID
            name: this.newTool.name.trim(),
            slug: this.newTool.name.toLowerCase().replace(/\s+/g, '-')
        };

        this.tools.push(tool);
        this.selectedTools.push(tool.id);
        this.newTool = { name: '' };
        this.showAddTool = false;

        this.snackBar.open('Tool added successfully', 'Close', { duration: 3000 });
    }

    // Food management
    onFoodToggle(foodId: string): void {
        const index = this.selectedFoods.indexOf(foodId);
        if (index > -1) {
            this.selectedFoods.splice(index, 1);
        } else {
            this.selectedFoods.push(foodId);
        }
    }

    addNewFood(): void {
        if (!this.newFood.name.trim()) {
            this.snackBar.open('Food name is required', 'Close', { duration: 3000 });
            return;
        }

        const food: RecipeFood = {
            id: Date.now().toString(), // Temporary ID
            name: this.newFood.name.trim(),
            slug: this.newFood.name.toLowerCase().replace(/\s+/g, '-')
        };

        this.foods.push(food);
        this.selectedFoods.push(food.id);
        this.newFood = { name: '' };
        this.showAddFood = false;

        this.snackBar.open('Food added successfully', 'Close', { duration: 3000 });
    }

    // Ingredient management
    addIngredient(): void {
        const ingredient = this.fb.group({
            quantity: [1, [Validators.required, Validators.min(0)]],
            unit: [''],
            food: ['', [Validators.required]],
            title: [''],
            note: [''],
            disableAmount: [false]
        });

        this.ingredients.push(ingredient);
    }

    removeIngredient(index: number): void {
        if (this.ingredients.length > 1) {
            this.ingredients.removeAt(index);
        }
    }

    duplicateIngredient(index: number): void {
        const ingredient = this.ingredients.at(index);
        const duplicate = this.fb.group({
            quantity: [ingredient.get('quantity')?.value],
            unit: [ingredient.get('unit')?.value],
            food: [ingredient.get('food')?.value],
            title: [ingredient.get('title')?.value],
            note: [ingredient.get('note')?.value],
            disableAmount: [ingredient.get('disableAmount')?.value]
        });

        this.ingredients.insert(index + 1, duplicate);
    }

    moveIngredient(index: number, direction: 'up' | 'down'): void {
        if (direction === 'up' && index > 0) {
            const ingredient = this.ingredients.at(index);
            this.ingredients.removeAt(index);
            this.ingredients.insert(index - 1, ingredient);
        } else if (direction === 'down' && index < this.ingredients.length - 1) {
            const ingredient = this.ingredients.at(index);
            this.ingredients.removeAt(index);
            this.ingredients.insert(index + 1, ingredient);
        }
    }

    // Instruction management
    addInstruction(): void {
        const instruction = this.fb.group({
            text: ['', [Validators.required, Validators.minLength(10)]]
        });

        this.instructions.push(instruction);
    }

    removeInstruction(index: number): void {
        if (this.instructions.length > 1) {
            this.instructions.removeAt(index);
        }
    }

    duplicateInstruction(index: number): void {
        const instruction = this.instructions.at(index);
        const duplicate = this.fb.group({
            text: [instruction.get('text')?.value]
        });

        this.instructions.insert(index + 1, duplicate);
    }

    moveInstruction(index: number, direction: 'up' | 'down'): void {
        if (direction === 'up' && index > 0) {
            const instruction = this.instructions.at(index);
            this.instructions.removeAt(index);
            this.instructions.insert(index - 1, instruction);
        } else if (direction === 'down' && index < this.instructions.length - 1) {
            const instruction = this.instructions.at(index);
            this.instructions.removeAt(index);
            this.instructions.insert(index + 1, instruction);
        }
    }

    insertInstruction(index: number): void {
        const instruction = this.fb.group({
            text: ['', [Validators.required, Validators.minLength(10)]]
        });

        this.instructions.insert(index, instruction);
    }

    // Utility methods
    getTotalTime(): number {
        const prepTime = this.recipeForm.get('prepTime')?.value || 0;
        const cookTime = this.recipeForm.get('cookTime')?.value || 0;
        return prepTime + cookTime;
    }

    getFormattedTime(minutes: number): string {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${remainingMinutes}m`;
    }

    getErrorMessage(fieldName: string): string {
        const field = this.recipeForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
        }
        if (field?.hasError('min')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors?.['min'].min}`;
        }
        return 'Invalid input';
    }

    // Form submission
    onSubmit(): void {
        if (this.recipeForm.valid) {
            this.loading = true;

            const recipeData = {
                ...this.recipeForm.value,
                categories: this.selectedCategories,
                tags: this.selectedTags,
                tools: this.selectedTools,
                foods: this.selectedFoods
            };

            this.recipeService.createRecipe(recipeData).pipe(takeUntil(this.destroy$)).subscribe({
                next: (recipe) => {
                    this.snackBar.open('Recipe created successfully!', 'Close', { duration: 5000 });
                    this.router.navigate(['/recipes', recipe.id]);
                },
                error: (error) => {
                    console.error('Error creating recipe:', error);
                    this.snackBar.open('Error creating recipe. Please try again.', 'Close', { duration: 5000 });
                    this.loading = false;
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.recipeForm.controls).forEach(key => {
            const control = this.recipeForm.get(key);
            control?.markAsTouched();
        });
    }

    onCancel(): void {
        this.router.navigate(['/recipes']);
    }
} 