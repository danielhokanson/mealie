import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { HouseholdService } from '../../../../core/services/household.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { Household } from '../../../../core/models/household.model';
import { PaginationData } from '../../../../core/models/pagination.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-household-members',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatSnackBarModule,
        MatMenuModule
    ],
    templateUrl: './household-members.component.html',
    styleUrl: './household-members.component.css'
})
export class HouseholdMembersComponent implements OnInit {
    household: Household | null = null;
    members: User[] = [];
    inviteForm: FormGroup;
    loading = false;

    constructor(
        private householdService: HouseholdService,
        private userService: UserService,
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        this.inviteForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            role: ['member', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadHouseholdData();
    }

    loadHouseholdData(): void {
        this.loading = true;
        this.householdService.getCurrentUserHousehold().subscribe({
            next: (household: Household) => {
                this.household = household;
                this.loadMembers();
            },
            error: (error: any) => {
                console.error('Error loading household:', error);
                this.loading = false;
            }
        });
    }

    loadMembers(): void {
        if (!this.household) return;

        this.householdService.getHouseholdMembers(this.household.id).subscribe({
            next: (response: PaginationData<User>) => {
                this.members = response.items || [];
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading members:', error);
                this.loading = false;
            }
        });
    }

    inviteMember(): void {
        if (this.inviteForm.valid && this.household) {
            const formData = this.inviteForm.value;
            this.loading = true;

            this.householdService.inviteMember(this.household.id, {
                email: formData.email,
                role: formData.role
            }).subscribe({
                next: () => {
                    this.inviteForm.reset();
                    this.loadMembers();
                    // You could add a snackbar notification here
                },
                error: (error) => {
                    console.error('Error inviting member:', error);
                    this.loading = false;
                    // You could add an error notification here
                }
            });
        }
    }

    removeMember(memberId: string): void {
        if (this.household && confirm('Are you sure you want to remove this member?')) {
            this.householdService.removeMemberFromHousehold(this.household.id, memberId).subscribe({
                next: () => {
                    this.loadMembers();
                    // You could add a snackbar notification here
                },
                error: (error) => {
                    console.error('Error removing member:', error);
                    // You could add an error notification here
                }
            });
        }
    }

    updateMemberRole(memberId: string, newRole: string): void {
        if (this.household) {
            this.householdService.updateMemberRole(this.household.id, memberId, newRole).subscribe({
                next: () => {
                    this.loadMembers();
                    // You could add a snackbar notification here
                },
                error: (error) => {
                    console.error('Error updating member role:', error);
                    // You could add an error notification here
                }
            });
        }
    }

    getRoleColor(role: string): string {
        switch (role) {
            case 'owner':
                return '#f44336';
            case 'admin':
                return '#ff9800';
            case 'member':
                return '#4caf50';
            default:
                return '#9e9e9e';
        }
    }

    canManageMembers(): boolean {
        if (!this.household) return false;
        // Check if current user is an admin or owner of the household
        const currentUser = this.authService.currentUser;
        if (!currentUser) return false;
        
        // Check if user is household owner
        if (this.household.ownerId === currentUser.id) return true;
        
        // Check if user has admin role in the household
        const member = this.members.find(m => m.id === currentUser.id);
        return member ? member.role === 'admin' || member.role === 'owner' : false;
    }
}

