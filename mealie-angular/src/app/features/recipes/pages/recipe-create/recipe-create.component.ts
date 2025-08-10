import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
    recipeForm: FormGroup;
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
    }

    private loadFormData(): void {
        // Load categories
        this.recipeService.getCategories().pipe(
            takeUntil(this.destroy$)
        ).subscribe(categories => {
            this.categories = categories;
        });

        // Load tags
        this.recipeService.getTags().pipe(
            takeUntil(this.destroy$)
        ).subscribe(tags => {
            this.tags = tags;
        });

        // Load tools
        this.recipeService.getTools().pipe(
            takeUntil(this.destroy$)
        ).subscribe(tools => {
            this.tools = tools;
        });

        // Load foods
        this.recipeService.getFoods().pipe(
            takeUntil(this.destroy$)
        ).subscribe(foods => {
            this.foods = foods;
        });
    }

    get ingredients(): FormArray {
        return this.recipeForm.get('ingredients') as FormArray;
    }

    get instructions(): FormArray {
        return this.recipeForm.get('instructions') as FormArray;
    }

    addIngredient(): void {
        const ingredient = this.fb.group({
            title: [''],
            note: [''],
            unit: [''],
            food: [''],
            quantity: [1, [Validators.required, Validators.min(0)]],
            disableAmount: [false]
        });
        this.ingredients.push(ingredient);
    }

    removeIngredient(index: number): void {
        this.ingredients.removeAt(index);
    }

    addInstruction(): void {
        const instruction = this.fb.group({
            text: ['', [Validators.required]],
            position: [this.instructions.length]
        });
        this.instructions.push(instruction);
    }

    removeInstruction(index: number): void {
        this.instructions.removeAt(index);
        // Update positions
        this.instructions.controls.forEach((control, i) => {
            control.patchValue({ position: i });
        });
    }

    onCategoryToggle(categoryId: string): void {
        const index = this.selectedCategories.indexOf(categoryId);
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            this.selectedCategories.push(categoryId);
        }
    }

    onTagToggle(tagId: string): void {
        const index = this.selectedTags.indexOf(tagId);
        if (index > -1) {
            this.selectedTags.splice(index, 1);
        } else {
            this.selectedTags.push(tagId);
        }
    }

    onToolToggle(toolId: string): void {
        const index = this.selectedTools.indexOf(toolId);
        if (index > -1) {
            this.selectedTools.splice(index, 1);
        } else {
            this.selectedTools.push(toolId);
        }
    }

    onFoodToggle(foodId: string): void {
        const index = this.selectedFoods.indexOf(foodId);
        if (index > -1) {
            this.selectedFoods.splice(index, 1);
        } else {
            this.selectedFoods.push(foodId);
        }
    }

    onSubmit(): void {
        if (this.recipeForm.valid) {
            this.loading = true;

            const recipeData = {
                ...this.recipeForm.value,
                totalTime: this.recipeForm.value.prepTime + this.recipeForm.value.cookTime,
                categoryIds: this.selectedCategories,
                tagIds: this.selectedTags,
                toolIds: this.selectedTools,
                foodIds: this.selectedFoods,
                ingredients: this.ingredients.value.map((ingredient: any, index: number) => ({
                    ...ingredient,
                    position: index
                })),
                instructions: this.instructions.value.map((instruction: any, index: number) => ({
                    ...instruction,
                    position: index
                }))
            };

            this.recipeService.createRecipe(recipeData).subscribe({
                next: (recipe) => {
                    this.snackBar.open('Recipe created successfully!', 'Close', {
                        duration: 3000
                    });
                    this.router.navigate(['/recipes', recipe.id]);
                },
                error: (error) => {
                    console.error('Error creating recipe:', error);
                    this.snackBar.open('Failed to create recipe. Please try again.', 'Close', {
                        duration: 5000
                    });
                    this.loading = false;
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    onCancel(): void {
        this.router.navigate(['/recipes']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.recipeForm.controls).forEach(key => {
            const control = this.recipeForm.get(key);
            control?.markAsTouched();
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.recipeForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        if (field?.hasError('min')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['min'].min}`;
        }
        return '';
    }

    getTotalTime(): number {
        const prepTime = this.recipeForm.get('prepTime')?.value || 0;
        const cookTime = this.recipeForm.get('cookTime')?.value || 0;
        return prepTime + cookTime;
    }

    getFormattedTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }
} 