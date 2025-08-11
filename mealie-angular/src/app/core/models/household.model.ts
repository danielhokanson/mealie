export interface Household {
    id: string;
    name: string;
    slug: string;
    description?: string;
    groupId: string;
    createdAt: Date;
    updatedAt: Date;
    users: HouseholdUser[];
}

export interface HouseholdUser {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
    joinedAt: Date;
}

export interface HouseholdInvitation {
    id: string;
    email: string;
    role: string;
    invitedBy: string;
    invitedAt: Date;
    expiresAt: Date;
    status: 'pending' | 'accepted' | 'expired';
}

export interface HouseholdPreferences {
    id: string;
    householdId: string;
    mealPlanEnabled: boolean;
    shoppingListEnabled: boolean;
    recipeSharingEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
