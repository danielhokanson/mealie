import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Recipe, RecipeIngredient, RecipeInstruction, RecipeCategory, RecipeTag } from '../../../../core/models/recipe.model';
import { FormatTimePipe } from '../../../../shared/pipes/format-time.pipe';

@Component({
    selector: 'app-recipe-print',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatChipsModule,
        MatListModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        FormatTimePipe
    ],
    templateUrl: './recipe-print.component.html',
    styleUrls: ['./recipe-print.component.scss']
})
export class RecipePrintComponent implements OnInit, OnDestroy {
    @Input() recipe: Recipe | null = null;

    loading = false;
    printMode = false;
    showNutrition = true;
    showNotes = true;
    showComments = true;
    showTimeline = false;

    private destroy$ = new Subject<void>();

    constructor(private snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.setupPrintStyles();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupPrintStyles(): void {
        // Add print-specific styles
        const style = document.createElement('style');
        style.id = 'recipe-print-styles';
        style.textContent = `
            @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
                .print-only { display: block !important; }
                .recipe-print-container { 
                    padding: 20px; 
                    max-width: none; 
                    margin: 0; 
                }
                .recipe-header { 
                    page-break-after: avoid; 
                }
                .recipe-ingredients { 
                    page-break-inside: avoid; 
                }
                .recipe-instructions { 
                    page-break-inside: avoid; 
                }
            }
        `;
        document.head.appendChild(style);
    }

    onPrint(): void {
        this.printMode = true;

        // Wait for any layout changes
        setTimeout(() => {
            window.print();
            this.printMode = false;
        }, 100);
    }

    onExportPDF(): void {
        // TODO: Implement PDF export
        this.snackBar.open('PDF export coming soon', 'Close', { duration: 2000 });
    }

    onShare(): void {
        // TODO: Implement sharing
        this.snackBar.open('Sharing coming soon', 'Close', { duration: 2000 });
    }

    onToggleNutrition(): void {
        this.showNutrition = !this.showNutrition;
    }

    onToggleNotes(): void {
        this.showNotes = !this.showNotes;
    }

    onToggleComments(): void {
        this.showComments = !this.showComments;
    }

    onToggleTimeline(): void {
        this.showTimeline = !this.showTimeline;
    }

    getFormattedTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    getTotalTime(): number {
        if (!this.recipe) return 0;
        return (this.recipe.prepTime || 0) + (this.recipe.cookTime || 0);
    }

    getCategoryColor(category: RecipeCategory): string {
        return category.color || '#666';
    }

    getTagColor(tag: RecipeTag): string {
        return tag.color || '#666';
    }

    getRatingStars(rating: number): boolean[] {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rating);
        }
        return stars;
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString();
    }

    getNutritionValue(nutrition: any, key: string): string {
        const value = nutrition?.[key];
        if (!value) return 'N/A';
        return `${value}${this.getNutritionUnit(key)}`;
    }

    private getNutritionUnit(key: string): string {
        const units: { [key: string]: string } = {
            calories: ' cal',
            protein: 'g',
            fat: 'g',
            carbohydrates: 'g',
            fiber: 'g',
            sugar: 'g',
            sodium: 'mg',
            cholesterol: 'mg'
        };
        return units[key] || '';
    }
} 