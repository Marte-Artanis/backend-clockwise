import { CustomError } from '../types/common'

export class ValidationError extends Error implements CustomError {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'validation/error'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class InvalidNameError extends ValidationError {
  constructor(message: string = 'Nome inválido') {
    super(message, 400, 'validation/invalid-name')
  }
}

export class InvalidEmailError extends ValidationError {
  constructor(message: string = 'Email inválido') {
    super(message, 400, 'validation/invalid-email')
  }
}

export class WeakPasswordError extends ValidationError {
  constructor(message: string = 'Senha muito fraca') {
    super(message, 400, 'validation/weak-password')
  }
}

export class EmailInUseError extends ValidationError {
  constructor(message: string = 'Email já está em uso') {
    super(message, 400, 'auth/email-in-use')
  }
}

export class InvalidCredentialsError extends ValidationError {
  constructor(message: string = 'Email ou senha inválidos') {
    super(message, 401, 'auth/invalid-credentials')
  }
}

export class ClockAlreadyOpenError extends ValidationError {
  constructor(message: string = 'Já existe um registro de ponto aberto') {
    super(message, 400, 'clock/already-open')
  }
}

export class NoOpenClockError extends ValidationError {
  constructor(message: string = 'Não existe um registro de ponto aberto') {
    super(message, 400, 'clock/no-open-entry')
  }
}

export class InvalidDateError extends ValidationError {
  constructor(message: string = 'Data inválida') {
    super(message, 400, 'validation/invalid-date')
  }
} 