import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { RecipeSettingsSwitchesComponent } from '../recipe-settings-switches/recipe-settings-switches.component';

export interface RecipeSettings {
    [key: string]: boolean;
}

@Component({
    selector: 'app-recipe-settings-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatCardModule,
        MatDividerModule,
        RecipeSettingsSwitchesComponent
    ],
    templateUrl: './recipe-settings-menu.component.html',
    styleUrls: ['./recipe-settings-menu.component.scss']
})
export class RecipeSettingsMenuComponent {
    @Input() value!: RecipeSettings;
    @Input() isOwner = false;

    @Output() valueChange = new EventEmitter<RecipeSettings>();

    onSettingsChange(newSettings: RecipeSettings): void {
        this.valueChange.emit(newSettings);
    }
} 