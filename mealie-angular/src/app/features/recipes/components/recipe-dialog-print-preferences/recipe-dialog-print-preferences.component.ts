import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../../../../core/models/recipe.model';

export interface PrintPreferencesData {
    recipe: Recipe;
}

@Component({
    selector: 'app-recipe-dialog-print-preferences',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        MatIconModule
    ],
    template: `
        <div class="dialog-container">
            <h2 mat-dialog-title>Print Preferences</h2>
            
            <div mat-dialog-content>
                <p><strong>{{ recipeName }}</strong></p>
                
                <form [formGroup]="form" class="form-container">
                    <div class="section">
                        <h3>Content Options</h3>
                        
                        <mat-checkbox formControlName="includeImage">
                            Include recipe image
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="includeDescription">
                            Include description
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="includeIngredients">
                            Include ingredients list
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="includeInstructions">
                            Include cooking instructions
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="includeNutrition">
                            Include nutrition information
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="includeNotes">
                            Include notes
                        </mat-checkbox>
                    </div>

                    <div class="section">
                        <h3>Layout Options</h3>
                        
                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Page Size</mat-label>
                            <mat-select formControlName="pageSize">
                                <mat-option value="letter">Letter (8.5" x 11")</mat-option>
                                <mat-option value="a4">A4 (210mm x 297mm)</mat-option>
                                <mat-option value="legal">Legal (8.5" x 14")</mat-option>
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Orientation</mat-label>
                            <mat-select formControlName="orientation">
                                <mat-option value="portrait">Portrait</mat-option>
                                <mat-option value="landscape">Landscape</mat-option>
                            </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Font Size</mat-label>
                            <mat-select formControlName="fontSize">
                                <mat-option value="small">Small (10pt)</mat-option>
                                <mat-option value="medium">Medium (12pt)</mat-option>
                                <mat-option value="large">Large (14pt)</mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>

                    <div class="section">
                        <h3>Print Options</h3>
                        
                        <mat-checkbox formControlName="printHeader">
                            Print header with recipe name
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="printFooter">
                            Print footer with page numbers
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="printBackground">
                            Print background colors and images
                        </mat-checkbox>
                        
                        <mat-checkbox formControlName="printMargins">
                            Show print margins
                        </mat-checkbox>
                    </div>
                </form>
            </div>
            
            <div mat-dialog-actions>
                <button mat-button (click)="onCancel()">Cancel</button>
                <button mat-raised-button color="primary" (click)="onPrint()">
                    Print Recipe
                </button>
            </div>
        </div>
    `,
    styleUrls: ['./recipe-dialog-print-preferences.component.scss']
})
export class RecipeDialogPrintPreferencesComponent implements OnInit {
    @Input() open: boolean = false;
    @Output() openChange = new EventEmitter<boolean>();
    @Input() recipe?: Recipe;

    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<RecipeDialogPrintPreferencesComponent>,
        @Inject(MAT_DIALOG_DATA) public data?: PrintPreferencesData
    ) {
        this.form = this.fb.group({
            includeImage: [true],
            includeDescription: [true],
            includeIngredients: [true],
            includeInstructions: [true],
            includeNutrition: [false],
            includeNotes: [true],
            pageSize: ['letter'],
            orientation: ['portrait'],
            fontSize: ['medium'],
            printHeader: [true],
            printFooter: [true],
            printBackground: [false],
            printMargins: [false]
        });
    }

    get recipeName(): string {
        return this.data?.recipe?.name || this.recipe?.name || 'Recipe';
    }

    ngOnInit(): void {
        // Initialize form with default values
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onPrint(): void {
        if (this.form.valid) {
            // Handle print logic here
            this.dialogRef.close(this.form.value);
        }
    }
}

