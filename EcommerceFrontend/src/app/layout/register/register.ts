import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { IUserData } from '../../core/models/user.model';
import { AuthService } from '../../core/services/authService/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

function matchPasswords(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ dismatchpassword: true });
      return { dismatchpassword: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  isError = signal(false);
  alertMessage = signal('');

  registerForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      phones: new FormArray([
        new FormGroup({
          number: new FormControl('', [Validators.required, Validators.pattern(/^\d{11}$/)]),
          isDefault: new FormControl(true),
        }),
      ]),
      addresses: new FormArray([
        new FormGroup({
          street: new FormControl('', [Validators.required]),
          city: new FormControl('', [Validators.required]),
          governorate: new FormControl('', [Validators.required]),
          isDefault: new FormControl(true),
        }),
      ]),
    },
    { validators: matchPasswords() }
  );

  private readonly _authService = inject(AuthService);
  private readonly _destroyRef = inject(DestroyRef);

  get phones() {
    return this.registerForm.get('phones') as FormArray;
  }

  addPhone() {
    this.phones.push(
      new FormGroup({
        number: new FormControl('', [Validators.required, Validators.pattern(/^\d{11}$/)]),
        isDefault: new FormControl(false),
      })
    );
  }

  removePhone(index: number) {
    this.phones.removeAt(index);
  }

  get addresses() {
    return this.registerForm.get('addresses') as FormArray;
  }

  addAddress() {
    this.addresses.push(
      new FormGroup({
        street: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required]),
        governorate: new FormControl('', [Validators.required]),
        isDefault: new FormControl(false),
      })
    );
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  setPhoneDefault(index: number) {
    this.phones.controls.forEach((phone, i) => {
      phone.patchValue({ isDefault: i === index });
    });
  }

  setAddressDefault(index: number) {
    this.addresses.controls.forEach((address, i) => {
      address.patchValue({ isDefault: i === index });
    });
  }

  register() {
    if (this.registerForm.invalid) return;

    const formValue = { ...this.registerForm.value };
    delete formValue.confirmPassword;
    const data = formValue as IUserData;

    this._authService
      .userRegister(data)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        error: (res) => {
          this.alertMessage.set(res.error.message);
          this.isError.set(true);
          setTimeout(() => this.isError.set(false), 2500);
        },
      });
  }
}
