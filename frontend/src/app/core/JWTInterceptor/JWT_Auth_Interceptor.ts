import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../Services/auth_service";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

export const JWT_Auth_Interceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.token();

    // Es lo mismo que hacer en cada metodo que requiera autenticacion: { headers: new HttpHeaders(this.authService.getAuthHeaders()) } pero de manera global para todas las peticiones
    // ↓↓
    const authRequest = token ?
        req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        }) : req;


    return next(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                authService.clearToken();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};