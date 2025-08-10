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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GroupService } from '../../../../core/services/group.service';
import { HouseholdService } from '../../../../core/services/household.service';
import { RecipeService } from '../../../../core/services/recipe.service';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';
import { User, Group, Household } from '../../../../core/models/user.model';
import { Recipe } from '../../../../core/models/recipe.model';
import { ShoppingList } from '../../../../core/models/shopping-list.model';

@Component({
    selector: 'app-group-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
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
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatDialogModule
    ],
    templateUrl: './group-dashboard.component.html',
    styleUrls: ['./group-dashboard.component.scss']
})
export class GroupDashboardComponent implements OnInit, OnDestroy {
    loading = true;
    error = false;
    currentUser: User | null = null;
    currentGroup: Group | null = null;
    households: Household[] = [];
    members: User[] = [];
    recentRecipes: Recipe[] = [];
    recentShoppingLists: ShoppingList[] = [];
    groupStats = {
        totalMembers: 0,
        totalRecipes: 0,
        totalShoppingLists: 0,
        activeHouseholds: 0
    };

    // Forms
    addMemberForm!: FormGroup;
    createHouseholdForm!: FormGroup;
    showAddMemberDialog = false;
    showCreateHouseholdDialog = false;

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private groupService: GroupService,
        private householdService: HouseholdService,
        private recipeService: RecipeService,
        private shoppingListService: ShoppingListService,
        private router: Router,
        private snackBar: MatSnackBar,
        private fb: FormBuilder
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.loadGroupData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForms(): void {
        this.addMemberForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            role: ['member', [Validators.required]]
        });

        this.createHouseholdForm = this.fb.group({
            name: ['', [Validators.required]],
            description: [''],
            isActive: [true]
        });
    }

    loadGroupData(): void {
        this.loading = true;
        this.error = false;

        // Get current user
        this.currentUser = this.authService.currentUser;

        if (this.currentUser) {
            // Load group data
            this.loadCurrentGroup();
            this.loadHouseholds();
            this.loadMembers();
            this.loadRecentActivity();
            this.calculateStats();
        }

        this.loading = false;
    }

    private loadCurrentGroup(): void {
        this.groupService.getCurrentUserGroup()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (group) => {
                    this.currentGroup = group;
                    this.calculateStats();
                },
                error: (error) => {
                    console.error('Error loading current group:', error);
                    this.error = true;
                    this.loading = false;
                }
            });
    }

    private loadHouseholds(): void {
        this.householdService.getAllHouseholds()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.households = response.items;
                    this.calculateStats();
                },
                error: (error) => {
                    console.error('Error loading households:', error);
                    // Fallback to empty array on error
                    this.households = [];
                }
            });
    }

    private loadMembers(): void {
        this.groupService.getGroupMembers()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.members = response.items;
                    this.calculateStats();
                },
                error: (error) => {
                    console.error('Error loading group members:', error);
                    // Fallback to empty array on error
                    this.members = [];
                }
            });
    }

    private loadRecentActivity(): void {
        // Load recent recipes
        this.recipeService.getAllRecipes(1, 5, { orderBy: 'updatedAt', orderDirection: 'desc' })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.recentRecipes = response.items;
                    this.calculateStats();
                },
                error: (error) => {
                    console.error('Error loading recent recipes:', error);
                    this.recentRecipes = [];
                }
            });

        // Load recent shopping lists
        this.shoppingListService.getAllShoppingLists(1, 5, { orderBy: 'updatedAt', orderDirection: 'desc' })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.recentShoppingLists = response.items;
                    this.calculateStats();
                },
                error: (error) => {
                    console.error('Error loading recent shopping lists:', error);
                    this.recentShoppingLists = [];
                }
            });
    }

    private calculateStats(): void {
        this.groupStats = {
            totalMembers: this.members.length,
            totalRecipes: this.recentRecipes.length,
            totalShoppingLists: this.recentShoppingLists.length,
            activeHouseholds: this.households.length
        };
    }

    onAddMember(): void {
        this.addMemberForm.reset();
        this.addMemberForm.patchValue({
            role: 'member'
        });
        this.showAddMemberDialog = true;
    }

    onSaveMember(): void {
        if (this.addMemberForm.valid) {
            const memberData = this.addMemberForm.value;

            this.groupService.addMember(memberData.email, memberData.role === 'admin')
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (newMember) => {
                        this.members.push(newMember);
                        this.calculateStats();
                        this.snackBar.open('Member added successfully', 'Close', { duration: 3000 });
                        this.showAddMemberDialog = false;
                        this.addMemberForm.reset();
                    },
                    error: (error) => {
                        console.error('Error adding member:', error);
                        this.snackBar.open('Error adding member. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        }
    }

    onRemoveMember(member: User): void {
        if (confirm(`Are you sure you want to remove ${member.fullName} from the group?`)) {
            this.groupService.removeMember(member.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.members = this.members.filter(m => m.id !== member.id);
                        this.calculateStats();
                        this.snackBar.open('Member removed successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error removing member:', error);
                        this.snackBar.open('Error removing member. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        }
    }

    onCreateHousehold(): void {
        this.createHouseholdForm.reset();
        this.createHouseholdForm.patchValue({
            isActive: true
        });
        this.showCreateHouseholdDialog = true;
    }

    onSaveHousehold(): void {
        if (this.createHouseholdForm.valid) {
            const householdData = this.createHouseholdForm.value;

            this.householdService.createHousehold({
                name: householdData.name,
                description: householdData.description,
                groupId: this.currentGroup!.id
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (newHousehold) => {
                        this.households.push(newHousehold);
                        this.calculateStats();
                        this.snackBar.open('Household created successfully', 'Close', { duration: 3000 });
                        this.showCreateHouseholdDialog = false;
                        this.createHouseholdForm.reset();
                    },
                    error: (error) => {
                        console.error('Error creating household:', error);
                        this.snackBar.open('Error creating household. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        }
    }

    onDeleteHousehold(household: Household): void {
        if (confirm(`Are you sure you want to delete household "${household.name}"?`)) {
            this.householdService.deleteHousehold(household.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.households = this.households.filter(h => h.id !== household.id);
                        this.calculateStats();
                        this.snackBar.open('Household deleted successfully', 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error deleting household:', error);
                        this.snackBar.open('Error deleting household. Please try again.', 'Close', { duration: 3000 });
                    }
                });
        }
    }

    onViewRecipes(): void {
        this.router.navigate(['/recipes']);
    }

    onViewShoppingLists(): void {
        this.router.navigate(['/shopping-lists']);
    }

    onViewMembers(): void {
        // TODO: Navigate to members management
        this.snackBar.open('Members management coming soon', 'Close', { duration: 2000 });
    }

    onViewHouseholds(): void {
        // TODO: Navigate to households management
        this.snackBar.open('Households management coming soon', 'Close', { duration: 2000 });
    }

    onExportGroupData(): void {
        // TODO: Implement group data export
        this.snackBar.open('Group data export coming soon', 'Close', { duration: 2000 });
    }

    onGroupSettings(): void {
        // TODO: Navigate to group settings
        this.snackBar.open('Group settings coming soon', 'Close', { duration: 2000 });
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleDateString();
    }

    getRoleColor(role: string): string {
        switch (role) {
            case 'admin':
                return '#f44336';
            case 'user':
                return '#2196f3';
            case 'member':
                return '#4caf50';
            default:
                return '#666';
        }
    }

    getStatusColor(isActive: boolean): string {
        return isActive ? '#4caf50' : '#f44336';
    }

    getErrorMessage(fieldName: string): string {
        const field = this.addMemberForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('email')) {
            return 'Please enter a valid email address';
        }
        return '';
    }
} 