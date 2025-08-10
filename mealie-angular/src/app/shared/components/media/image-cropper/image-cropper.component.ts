import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';

export interface Control {
    color: string;
    icon: string;
    callback: () => void;
}

@Component({
    selector: 'app-image-cropper',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatListModule
    ],
    templateUrl: './image-cropper.component.html',
    styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent {
    @ViewChild('cropperCanvas') cropperCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('cropperImage') cropperImage!: ElementRef<HTMLImageElement>;

    @Input() img: string = '';
    @Input() cropperHeight?: string;
    @Input() cropperWidth?: string;
    @Input() submitted: boolean = false;

    @Output() save = new EventEmitter<Blob>();
    @Output() delete = new EventEmitter<void>();

    changed: number = 0;
    cropper: any = null;
    canvas: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;

    controls: Control[][] = [
        [
            {
                color: 'info',
                icon: 'flip_horizontal',
                callback: () => this.flip(true, false)
            },
            {
                color: 'info',
                icon: 'flip_vertical',
                callback: () => this.flip(false, true)
            }
        ],
        [
            {
                color: 'info',
                icon: 'rotate_left',
                callback: () => this.rotate(-90)
            },
            {
                color: 'info',
                icon: 'rotate_right',
                callback: () => this.rotate(90)
            }
        ]
    ];

    ngOnInit(): void {
        this.initializeCropper();
    }

    ngAfterViewInit(): void {
        this.setupCanvas();
    }

    initializeCropper(): void {
        // Initialize cropper logic
        // In a real implementation, you would use a library like cropperjs
        this.setupCanvas();
    }

    setupCanvas(): void {
        if (this.cropperCanvas) {
            this.canvas = this.cropperCanvas.nativeElement;
            this.ctx = this.canvas.getContext('2d');
            this.loadImage();
        }
    }

    loadImage(): void {
        if (this.cropperImage && this.ctx && this.canvas) {
            const img = this.cropperImage.nativeElement;
            img.onload = () => {
                this.canvas!.width = img.naturalWidth;
                this.canvas!.height = img.naturalHeight;
                this.ctx!.drawImage(img, 0, 0);
                this.changed = -1;
            };
            img.src = this.img;
        }
    }

    flip(horizontal: boolean, vertical?: boolean): void {
        if (!this.ctx || !this.canvas) return;

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        if (horizontal) {
            this.ctx.scale(-1, 1);
        }
        if (vertical) {
            this.ctx.scale(1, -1);
        }

        this.ctx.drawImage(this.canvas, -this.canvas.width / 2, -this.canvas.height / 2);
        this.ctx.restore();

        this.changed++;
    }

    rotate(angle: number): void {
        if (!this.ctx || !this.canvas) return;

        const radians = (angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const newWidth = Math.abs(this.canvas.width * cos) + Math.abs(this.canvas.height * sin);
        const newHeight = Math.abs(this.canvas.width * sin) + Math.abs(this.canvas.height * cos);

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;

            tempCtx.translate(newWidth / 2, newHeight / 2);
            tempCtx.rotate(radians);
            tempCtx.drawImage(this.canvas, -this.canvas.width / 2, -this.canvas.height / 2);

            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            this.ctx.drawImage(tempCanvas, 0, 0);
        }

        this.changed++;
    }

    saveImage(): void {
        if (!this.canvas) return;

        this.canvas.toBlob((blob) => {
            if (blob) {
                this.save.emit(blob);
            }
        }, 'image/jpeg', 0.9);
    }

    onDelete(): void {
        this.delete.emit();
    }

    onSave(): void {
        this.saveImage();
    }
} 