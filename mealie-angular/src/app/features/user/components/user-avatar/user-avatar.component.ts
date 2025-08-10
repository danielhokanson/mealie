import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface User {
    id: string;
    fullName: string;
    username: string;
    email: string;
    image?: string;
    groupId: string;
    createdAt: Date;
    updatedAt: Date;
}

@Component({
    selector: 'app-user-avatar',
    standalone: true,
    imports: [CommonModule, MatTooltipModule],
    templateUrl: './user-avatar.component.html',
    styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent {
    @Input() userId!: string;
    @Input() list = false;
    @Input() size = 42;
    @Input() tooltip = true;
    @Input() user?: User;

    @Output() imageLoad = new EventEmitter<void>();
    @Output() imageError = new EventEmitter<void>();

    error = false;

    get avatarSize(): number {
        return this.list ? 32 : this.size;
    }

    get imageURL(): string {
        if (!this.userId) return '';
        // In a real app, you'd get the cache key from an auth service
        const cacheKey = Date.now(); // Simplified cache key
        return `/api/media/users/${this.userId}/profile.webp?cacheKey=${cacheKey}`;
    }

    get userInitials(): string {
        if (!this.user?.fullName) return '?';

        const names = this.user.fullName.split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }

        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    onImageLoad(): void {
        this.error = false;
        this.imageLoad.emit();
    }

    onImageError(): void {
        this.error = true;
        this.imageError.emit();
    }
} 