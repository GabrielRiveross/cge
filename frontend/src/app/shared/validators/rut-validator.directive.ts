import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
  NgControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';

//  Usamos tu validador ya existente
import { rutPersonaValidator } from './rut.validator';

@Directive({
  selector: '[appRutValido]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: RutValidatorDirective,
      multi: true,
    },
  ],
})
export class RutValidatorDirective implements Validator, OnInit, OnDestroy {
  private statusSub?: Subscription;

  constructor(
    private ngControl: NgControl,
    private el: ElementRef<HTMLInputElement>,
  ) {}

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    const fn = rutPersonaValidator();
    return fn(control);
  }

  ngOnInit(): void {
    this.statusSub = this.ngControl.statusChanges?.subscribe(() => {
      const input = this.el.nativeElement as HTMLInputElement;

      if (this.ngControl.invalid && (this.ngControl.touched || this.ngControl.dirty)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
      } else if (this.ngControl.valid && this.ngControl.value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
      } else {
        input.classList.remove('input-error', 'input-success');
      }
    });
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
  }
}
