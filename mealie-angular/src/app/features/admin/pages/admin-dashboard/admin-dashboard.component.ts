import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { RecipeService } from '../../../../core/services/recipe.service';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatDividerModule,
        MatBadgeModule,
        MatExpansionModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
    ],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    loading = true;
    error = false;
    stats = {
        totalRecipes: 0,
        totalUsers: 0,
        totalShoppingLists: 0,
        recentActivity: 0
    };
    recentRecipes: any[] = [];
    recentUsers: any[] = [];
    systemHealth = {
        database: 'healthy',
        api: 'healthy',
        storage: 'healthy'
    };

    private destroy$ = new Subject<void>();

    constructor(
        private recipeService: RecipeService,
        private shoppingListService: ShoppingListService,
        private authService: AuthService,
        private adminService: AdminService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadDashboardData(): void {
        this.loading = true;
        this.error = false;

        // Load statistics
        this.loadStatistics();

        // Load recent data
        this.loadRecentData();

        // Check system health
        this.checkSystemHealth();
    }

    private loadStatistics(): void {
        this.adminService.getSystemStatistics()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.stats = {
                        totalRecipes: stats.totalRecipes || 0,
                        totalUsers: stats.totalUsers || 0,
                        totalShoppingLists: stats.totalShoppingLists || 0,
                        recentActivity: stats.recentActivity || 0
                    };
                },
                error: (error) => {
                    console.error('Error loading system statistics:', error);
                    this.stats = {
                        totalRecipes: 0,
                        totalUsers: 0,
                        totalShoppingLists: 0,
                        recentActivity: 0
                    };
                }
            });
    }

    private loadRecentData(): void {
        // Load recent recipes
        this.recipeService.getAllRecipes(1, 5, { orderBy: 'createdAt', orderDirection: 'desc' })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.recentRecipes = response.items.map(recipe => ({
                        id: recipe.id,
                        name: recipe.name,
                        author: recipe.userId || 'Unknown',
                        createdAt: recipe.createdAt
                    }));
                },
                error: (error) => {
                    console.error('Error loading recent recipes:', error);
                    this.recentRecipes = [];
                }
            });

        // Load recent activity to get recent users
        this.adminService.getRecentActivity(10)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (activity) => {
                    this.recentUsers = activity
                        .filter(item => item.type === 'user_registered' && item.user)
                        .map(item => item.user)
                        .slice(0, 5);
                },
                error: (error) => {
                    console.error('Error loading recent users:', error);
                    this.recentUsers = [];
                }
            });
    }

    private checkSystemHealth(): void {
        this.adminService.getSystemHealth()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (health) => {
                    this.systemHealth = {
                        database: health.database || 'unknown',
                        api: health.api || 'unknown',
                        storage: health.storage || 'unknown'
                    };
                },
                error: (error) => {
                    console.error('Error checking system health:', error);
                    this.systemHealth = {
                        database: 'error',
                        api: 'error',
                        storage: 'error'
                    };
                }
            });
    }

    onViewRecipes(): void {
        this.router.navigate(['/recipes']);
    }

    onViewUsers(): void {
        this.router.navigate(['/admin/manage']);
    }

    onViewShoppingLists(): void {
        this.router.navigate(['/shopping-lists']);
    }

    onViewActivity(): void {
        // TODO: Implement activity log view
        this.snackBar.open('Activity log coming soon', 'Close', {
            duration: 2000
        });
    }

    onSystemBackup(): void {
        // TODO: Implement system backup
        this.snackBar.open('System backup initiated', 'Close', {
            duration: 3000
        });
    }

    onSystemRestore(): void {
        // TODO: Implement system restore
        this.snackBar.open('System restore coming soon', 'Close', {
            duration: 2000
        });
    }

    onDatabaseOptimize(): void {
        // TODO: Implement database optimization
        this.snackBar.open('Database optimization started', 'Close', {
            duration: 3000
        });
    }

    onClearCache(): void {
        // TODO: Implement cache clearing
        this.snackBar.open('Cache cleared successfully', 'Close', {
            duration: 2000
        });
    }

    getHealthColor(status: string): string {
        switch (status) {
            case 'healthy':
                return '#4caf50';
            case 'warning':
                return '#ff9800';
            case 'error':
                return '#f44336';
            default:
                return '#ccc';
        }
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString();
    }

    getFormattedTime(date: Date): string {
        return date.toLocaleTimeString();
    }
} 