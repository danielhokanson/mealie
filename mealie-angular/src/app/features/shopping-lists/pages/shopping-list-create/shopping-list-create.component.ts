import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';
import { ShoppingList, MultiPurposeLabel } from '../../../../core/models/shopping-list.model';

@Component({
    selector: 'app-shopping-list-create',
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
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatDividerModule
    ],
    templateUrl: './shopping-list-create.component.html',
    styleUrls: ['./shopping-list-create.component.scss']
})
export class ShoppingListCreateComponent implements OnInit, OnDestroy {
    shoppingListForm: FormGroup;
    loading = false;
    labels: MultiPurposeLabel[] = [];
    selectedLabels: string[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private shoppingListService: ShoppingListService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.shoppingListForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            private: [false]
        });
    }

    ngOnInit(): void {
        this.loadLabels();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadLabels(): void {
        this.shoppingListService.getLabels().pipe(
            takeUntil(this.destroy$)
        ).subscribe(labels => {
            this.labels = labels;
        });
    }

    onLabelToggle(labelId: string): void {
        const index = this.selectedLabels.indexOf(labelId);
        if (index > -1) {
            this.selectedLabels.splice(index, 1);
        } else {
            this.selectedLabels.push(labelId);
        }
    }

    onSubmit(): void {
        if (this.shoppingListForm.valid) {
            this.loading = true;

            const shoppingListData = {
                ...this.shoppingListForm.value,
                labelIds: this.selectedLabels
            };

            this.shoppingListService.createShoppingList(shoppingListData).subscribe({
                next: (shoppingList) => {
                    this.snackBar.open('Shopping list created successfully!', 'Close', {
                        duration: 3000
                    });
                    this.router.navigate(['/shopping-lists', shoppingList.id]);
                },
                error: (error) => {
                    console.error('Error creating shopping list:', error);
                    this.snackBar.open('Failed to create shopping list. Please try again.', 'Close', {
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
        this.router.navigate(['/shopping-lists']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.shoppingListForm.controls).forEach(key => {
            const control = this.shoppingListForm.get(key);
            control?.markAsTouched();
        });
    }

    getErrorMessage(fieldName: string): string {
        const field = this.shoppingListForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field?.errors?.['minlength'].requiredLength} characters`;
        }
        return '';
    }
} 