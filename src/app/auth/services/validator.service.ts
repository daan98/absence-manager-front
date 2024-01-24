import { Injectable } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

  public isValidField(form : FormGroup, field : string) : boolean | null {
    return form.controls[field].errors && form.controls[field].touched;
  }

  public areFieldsEquals(field1 : string, field2 : string) : ValidationErrors | null {
    return (formGroup : FormGroup) : ValidationErrors | null => {
      const firstFieldValue  = formGroup.get(field1)?.value;
      const secondFieldValue = formGroup.get(field2)?.value;

      if (firstFieldValue !== secondFieldValue) {
        formGroup.get(field2)?.setErrors({ notEqual: true });
        return { notEqual: true };
      }

      formGroup.get(field2)?.setErrors(null);
      return null;
    }
  }
}
