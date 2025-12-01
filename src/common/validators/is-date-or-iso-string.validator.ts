import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDateOrIsoString', async: false })
export class IsDateOrIsoStringValidator
  implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') return false;

    // Accept both YYYY-MM-DD and ISOString formats
    const isoStringRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    
    if (!isoStringRegex.test(value)) return false;

    // Check if it's a valid date
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid date (YYYY-MM-DD or ISOString)`;
  }
}
