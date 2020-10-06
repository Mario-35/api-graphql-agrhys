/**
 * Custom application errors.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

export class UnauthorizedError extends Error {
  readonly code = 401;

  constructor(message = "Anonymous access is denied.") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ForbiddenError extends Error {
  readonly code = 403;

  constructor(message = "Access is denied.") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class createCustomError extends Error {
  code = 500;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
