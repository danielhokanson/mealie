import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dev-dump-json',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './dev-dump-json.component.html',
    styleUrls: ['./dev-dump-json.component.scss']
})
export class DevDumpJsonComponent {
    @Input() data: any = null;
    @Input() show: boolean = false;
} 