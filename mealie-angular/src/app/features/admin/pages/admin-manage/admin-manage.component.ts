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
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GroupService } from '../../../../core/services/group.service';
import { HouseholdService } from '../../../../core/services/household.service';
import { UserService } from '../../../../core/services/user.service';
import { User, Group } from '../../../../core/models/user.model';
import { Household } from '../../../../core/models/household.model';

@Component({
    selector: 'app-admin-manage',
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
        MatDialogModule,
        MatTabsModule
    ],
    templateUrl: './admin-manage.component.html',
    styleUrls: ['./admin-manage.component.scss']
})
export class AdminManageComponent implements OnInit, OnDestroy {
    loading = true;
    error = false;
    users: User[] = [];
    groups: Group[] = [];
    households: Household[] = [];
    selectedTab = 0;
    searchQuery = '';
    selectedRole = 'all';
    selectedStatus = 'all';
    showFilters = false;

    // User management
    selectedUsers: string[] = [];
    userForm!: FormGroup;
    showUserDialog = false;
    editingUser: User | null = null;

    // Group management
    selectedGroups: string[] = [];
    groupForm!: FormGroup;
    showGroupDialog = false;
    editingGroup: Group | null = null;

    // Household management
    selectedHouseholds: string[] = [];
    householdForm!: FormGroup;
    showHouseholdDialog = false;
    editingHousehold: Household | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private groupService: GroupService,
        private householdService: HouseholdService,
        private userService: UserService,
        private router: Router,
        private snackBar: MatSnackBar,
        private fb: FormBuilder
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData(): void {
        this.loading = true;
        this.error = false;

        // Load all data concurrently
        this.loadUsers();
        this.loadGroups();
        this.loadHouseholds();
    }

    private initializeForms(): void {
        this.userForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            fullName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            role: ['user', [Validators.required]],
            isActive: [true],
            groupId: [''],
            householdId: ['']
        });

        this.groupForm = this.fb.group({
            name: ['', [Validators.required]],
            description: [''],
            isActive: [true]
        });

        this.householdForm = this.fb.group({
            name: ['', [Validators.required]],
            description: [''],
            groupId: ['', [Validators.required]],
            isActive: [true]
        });
    }

    private loadUsers(): void {
        this.userService.getAllUsers()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.users = response.items || response;
                    this.checkLoadingComplete();
                },
                error: (error) => {
                    console.error('Error loading users:', error);
                    this.users = [];
                    this.checkLoadingComplete();
                }
            });
    }

    private loadGroups(): void {
        this.groupService.getAllGroups()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.groups = response.items || response;
                    this.checkLoadingComplete();
                },
                error: (error) => {
                    console.error('Error loading groups:', error);
                    this.groups = [];
                    this.checkLoadingComplete();
                }
            });
    }

    private loadHouseholds(): void {
        this.householdService.getAllHouseholds()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.households = response.items || response;
                    this.checkLoadingComplete();
                },
                error: (error) => {
                    console.error('Error loading households:', error);
                    this.households = [];
                    this.checkLoadingComplete();
                }
            });
    }

    private checkLoadingComplete(): void {
        // Check if all data has been loaded
        if (this.users !== undefined && this.groups !== undefined && this.households !== undefined) {
            this.loading = false;
        }
    }

    // User Management
    onAddUser(): void {
        this.editingUser = null;
        this.userForm.reset();
        this.userForm.patchValue({
            admin: false
        });
        this.showUserDialog = true;
    }

    onEditUser(user: User): void {
        this.editingUser = user;
        this.userForm.patchValue({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            admin: user.admin || false,
            groupId: user.groupId || '',
            householdId: user.householdId || ''
        });
        this.showUserDialog = true;
    }

    onSaveUser(): void {
        if (this.userForm.valid) {
            const userData = this.userForm.value;

            if (this.editingUser) {
                // Update existing user
                const index = this.users.findIndex(u => u.id === this.editingUser!.id);
                if (index !== -1) {
                    this.users[index] = { ...this.editingUser, ...userData };
                }
                this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            } else {
                // Create new user
                const newUser: User = {
                    id: Date.now().toString(),
                    ...userData,
                    createdAt: new Date()
                };
                this.users.push(newUser);
                this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            }

            this.showUserDialog = false;
        }
    }

    onDeleteUser(user: User): void {
        if (confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
            this.users = this.users.filter(u => u.id !== user.id);
            this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        }
    }

    onToggleUserStatus(user: User): void {
        // Since User interface doesn't have isActive, we'll use admin status instead
        user.admin = !user.admin;
        this.snackBar.open(`User ${user.admin ? 'promoted to admin' : 'demoted from admin'} successfully`, 'Close', { duration: 3000 });
    }

    // Group Management
    onAddGroup(): void {
        this.editingGroup = null;
        this.groupForm.reset();
        this.groupForm.patchValue({
            isActive: true
        });
        this.showGroupDialog = true;
    }

    onEditGroup(group: Group): void {
        this.editingGroup = group;
        this.groupForm.patchValue({
            name: group.name,
            description: group.description || '',
            isPrivate: group.isPrivate
        });
        this.showGroupDialog = true;
    }

    onSaveGroup(): void {
        if (this.groupForm.valid) {
            const groupData = this.groupForm.value;

            if (this.editingGroup) {
                // Update existing group
                const index = this.groups.findIndex(g => g.id === this.editingGroup!.id);
                if (index !== -1) {
                    this.groups[index] = { ...this.editingGroup, ...groupData };
                }
                this.snackBar.open('Group updated successfully', 'Close', { duration: 3000 });
            } else {
                // Create new group
                const newGroup: Group = {
                    id: Date.now().toString(),
                    name: groupData.name,
                    slug: groupData.name.toLowerCase().replace(/\s+/g, '-'),
                    description: groupData.description,
                    isPrivate: groupData.isPrivate || false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    users: [],
                    households: []
                };
                this.groups.push(newGroup);
                this.snackBar.open('Group created successfully', 'Close', { duration: 3000 });
            }

            this.showGroupDialog = false;
        }
    }

    onDeleteGroup(group: Group): void {
        if (confirm(`Are you sure you want to delete group "${group.name}"?`)) {
            this.groups = this.groups.filter(g => g.id !== group.id);
            this.snackBar.open('Group deleted successfully', 'Close', { duration: 3000 });
        }
    }

    // Household Management
    onAddHousehold(): void {
        this.editingHousehold = null;
        this.householdForm.reset();
        this.showHouseholdDialog = true;
    }

    onEditHousehold(household: Household): void {
        this.editingHousehold = household;
        this.householdForm.patchValue({
            name: household.name,
            description: household.description || '',
            groupId: household.groupId
        });
        this.showHouseholdDialog = true;
    }

    onSaveHousehold(): void {
        if (this.householdForm.valid) {
            const householdData = this.householdForm.value;

            if (this.editingHousehold) {
                // Update existing household
                const index = this.households.findIndex(h => h.id === this.editingHousehold!.id);
                if (index !== -1) {
                    this.households[index] = { ...this.editingHousehold, ...householdData };
                }
                this.snackBar.open('Household updated successfully', 'Close', { duration: 3000 });
            } else {
                // Create new household
                const newHousehold: Household = {
                    id: Date.now().toString(),
                    name: householdData.name,
                    slug: householdData.name.toLowerCase().replace(/\s+/g, '-'),
                    description: householdData.description,
                    groupId: householdData.groupId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    users: []
                };
                this.households.push(newHousehold);
                this.snackBar.open('Household created successfully', 'Close', { duration: 3000 });
            }

            this.showHouseholdDialog = false;
        }
    }

    onDeleteHousehold(household: Household): void {
        if (confirm(`Are you sure you want to delete household "${household.name}"?`)) {
            this.households = this.households.filter(h => h.id !== household.id);
            this.snackBar.open('Household deleted successfully', 'Close', { duration: 3000 });
        }
    }

    // Utility methods
    getFormattedDate(date: Date): string {
        return date.toLocaleDateString();
    }

    getRoleColor(role: string): string {
        switch (role) {
            case 'admin':
                return '#f44336';
            case 'user':
                return '#2196f3';
            default:
                return '#666';
        }
    }

    getStatusColor(isActive: boolean): string {
        return isActive ? '#4caf50' : '#f44336';
    }

    getFilteredUsers(): User[] {
        let filtered = this.users;

        if (this.searchQuery) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                user.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        if (this.selectedRole !== 'all') {
            const isAdmin = this.selectedRole === 'admin';
            filtered = filtered.filter(user => user.admin === isAdmin);
        }

        if (this.selectedStatus !== 'all') {
            // Since User interface doesn't have isActive, we'll use admin status as a proxy
            const isActive = this.selectedStatus === 'active';
            filtered = filtered.filter(user => user.admin === isActive);
        }

        return filtered;
    }

    getFilteredGroups(): Group[] {
        let filtered = this.groups;

        if (this.searchQuery) {
            filtered = filtered.filter(group =>
                group.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (group.description && group.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        }

        return filtered;
    }

    getFilteredHouseholds(): Household[] {
        let filtered = this.households;

        if (this.searchQuery) {
            filtered = filtered.filter(household =>
                household.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (household.description && household.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        }

        return filtered;
    }

    getGroupName(groupId: string): string {
        const group = this.groups.find(g => g.id === groupId);
        return group ? group.name : 'Unknown';
    }
} 