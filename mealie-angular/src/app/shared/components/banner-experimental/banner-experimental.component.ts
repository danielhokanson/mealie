import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-banner-experimental',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './banner-experimental.component.html',
    styleUrls: ['./banner-experimental.component.scss']
})
export class BannerExperimentalComponent { } 