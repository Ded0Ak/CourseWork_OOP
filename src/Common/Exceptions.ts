export class DeaneryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DataAccessException extends DeaneryException {
  constructor(message: string) {
    super(`Data Access Error: ${message}`);
  }
}

export class ValidationException extends DeaneryException {
  constructor(message: string) {
    super(`Validation Error: ${message}`);
  }
}

export class CapacityExceededException extends DeaneryException {
  constructor(entity: string, current: number, max: number) {
    super(`${entity} capacity exceeded: ${current}/${max}`);
  }
}

export class EntityNotFoundException extends DeaneryException {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' not found`);
  }
}

export class DuplicateEntityException extends DeaneryException {
  constructor(entity: string, identifier: string) {
    super(`${entity} with identifier '${identifier}' already exists`);
  }
}