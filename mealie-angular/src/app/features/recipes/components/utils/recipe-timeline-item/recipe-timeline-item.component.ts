import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { SafeMarkdownComponent } from '../safe-markdown/safe-markdown.component';
import { RecipeCardMobileComponent } from '../recipe-card-mobile/recipe-card-mobile.component';
import { RecipeTimelineContextMenuComponent } from '../recipe-timeline-context-menu/recipe-timeline-context-menu.component';

export interface RecipeTimelineEvent {
    id: string;
    recipeId: string;
    userId: string;
    subject: string;
    eventMessage: string;
    image?: string;
    timestamp: Date;
    eventType: TimelineEventType;
}

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    image?: string;
    rating?: number;
    slug: string;
    // ... other recipe properties
}

export type TimelineEventType = 'created' | 'updated' | 'deleted' | 'favorited' | 'unfavorited' | 'made' | 'shared';

export interface EventTypeOption {
    value: TimelineEventType;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-recipe-timeline-item',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatDividerModule,
        MatMenuModule,
        MatButtonModule,
        UserAvatarComponent,
        SafeMarkdownComponent,
        RecipeCardMobileComponent,
        RecipeTimelineContextMenuComponent
    ],
    templateUrl: './recipe-timeline-item.component.html',
    styleUrls: ['./recipe-timeline-item.component.scss']
})
export class RecipeTimelineItemComponent {
    @Input() event!: RecipeTimelineEvent;
    @Input() recipe?: Recipe;
    @Input() showRecipeCards = false;
    @Input() width?: string;

    @Output() selected = new EventEmitter<void>();
    @Output() update = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();

    hideImage = false;
    currentUser = { id: 'current-user-id' }; // In a real app, get from auth service

    get useMobileFormat(): boolean {
        return window.innerWidth <= 768;
    }

    get attrs(): any {
        if (this.useMobileFormat) {
            return {
                class: 'px-0',
                small: false,
                avatar: {
                    size: '30px',
                    class: 'pr-0'
                },
                image: {
                    maxHeight: '250',
                    class: 'my-3'
                }
            };
        } else {
            return {
                class: 'px-3',
                small: false,
                avatar: {
                    size: '42px',
                    class: ''
                },
                image: {
                    maxHeight: '300',
                    class: 'mb-5'
                }
            };
        }
    }

    get icon(): string {
        const eventTypeOptions: EventTypeOption[] = [
            { value: 'created', label: 'Created', icon: 'add' },
            { value: 'updated', label: 'Updated', icon: 'edit' },
            { value: 'deleted', label: 'Deleted', icon: 'delete' },
            { value: 'favorited', label: 'Favorited', icon: 'favorite' },
            { value: 'unfavorited', label: 'Unfavorited', icon: 'favorite_border' },
            { value: 'made', label: 'Made', icon: 'restaurant' },
            { value: 'shared', label: 'Shared', icon: 'share' }
        ];

        const option = eventTypeOptions.find(option => option.value === this.event.eventType);
        return option ? option.icon : 'info';
    }

    get eventImageUrl(): string {
        if (this.event.image !== 'has image') {
            return '';
        }
        // In a real app, construct the image URL
        return `/api/media/recipes/${this.event.recipeId}/timeline/${this.event.id}`;
    }

    get canEdit(): boolean {
        return this.currentUser && this.currentUser.id === this.event.userId && this.event.eventType !== 'system';
    }

    get formattedDate(): string {
        return new Date(this.event.timestamp).toLocaleDateString();
    }

    onCardClick(): void {
        this.selected.emit();
    }

    onImageError(): void {
        this.hideImage = true;
    }
} 