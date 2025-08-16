import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandler) {
    const authService = new AuthService();
    const router = new Router();

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