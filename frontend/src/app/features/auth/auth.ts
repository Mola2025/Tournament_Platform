import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/Services/auth_service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly mode = signal<'login' | 'register'>(
    (this.route.snapshot.data['mode'] as 'login' | 'register') ?? 'login',
  );
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    name: [''],
    username: [''],
    email: [''],
    identifier: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    if (this.mode() === 'register') {
      this.form.controls.name.addValidators([Validators.required, Validators.minLength(2)]);
      this.form.controls.username.addValidators([Validators.required, Validators.minLength(2)]);
      this.form.controls.email.addValidators([Validators.required, Validators.email]);
    } else {
      this.form.controls.identifier.addValidators([Validators.required]);
    }
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.mode() === 'register') {
      this.register();
      return;
    }

    this.login();
  }

  private register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .register({
        name: this.form.controls.name.getRawValue(),
        username: this.form.controls.username.getRawValue(),
        email: this.form.controls.email.getRawValue(),
        password: this.form.controls.password.getRawValue(),
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message ?? 'Could not complete registration.');
        },
      });
  }

  private login(): void {
    if (this.form.controls.identifier.invalid || this.form.controls.password.invalid) {
      this.form.controls.identifier.markAsTouched();
      this.form.controls.password.markAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .login({
        identifier: this.form.controls.identifier.getRawValue(),
        password: this.form.controls.password.getRawValue(),
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/home');
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message ?? 'Could not sign in.');
        },
      });
  }
}
