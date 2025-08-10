import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './app-toolbar.component.html',
    styleUrls: ['./app-toolbar.component.scss']
})
export class AppToolbarComponent {
    @Input() back: boolean = false;

    constructor(private router: Router) { }

    goBack(): void {
        this.router.navigate(['../']);
    }
} 