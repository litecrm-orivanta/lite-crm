import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsIndianPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isIndianPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Optional field
          
          // Remove spaces, dashes, and parentheses
          const normalized = value.replace(/[\s\-\(\)]/g, '');
          
          // Indian phone number: 10 digits starting with 6-9, optionally prefixed with +91
          const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;
          
          return indianPhoneRegex.test(normalized);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Phone number must be a valid Indian mobile number (10 digits starting with 6-9)';
        },
      },
    });
  };
}
