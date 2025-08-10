import { inject } from '@angular/core';
import {
    HttpRequest,
    HttpHandlerFn,
    HttpErrorResponse
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // If we get a 401, clear auth and redirect to login
                authService.logout();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
}