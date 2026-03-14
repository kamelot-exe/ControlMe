import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function IsTimeZone(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isTimeZone",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: isValidTimeZone,
        defaultMessage(args?: ValidationArguments) {
          return `${args?.property ?? "value"} must be a valid IANA time zone`;
        },
      },
    });
  };
}
