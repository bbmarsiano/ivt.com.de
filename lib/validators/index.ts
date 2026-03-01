export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  url: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  },

  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max;
  },
};

export const validateEmail = (email: string, errorMessages?: { required?: string; invalid?: string }): ValidationResult => {
  if (!validators.required(email)) {
    return {
      isValid: false,
      error: errorMessages?.required || 'Email is required',
    };
  }

  if (!validators.email(email)) {
    return {
      isValid: false,
      error: errorMessages?.invalid || 'Invalid email format',
    };
  }

  return { isValid: true };
};

export const validateUrl = (url: string, errorMessages?: { required?: string; invalid?: string }): ValidationResult => {
  if (!validators.required(url)) {
    return {
      isValid: false,
      error: errorMessages?.required || 'URL is required',
    };
  }

  if (!validators.url(url)) {
    return {
      isValid: false,
      error: errorMessages?.invalid || 'Invalid URL format',
    };
  }

  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string, errorMessage?: string): ValidationResult => {
  if (!validators.required(value)) {
    return {
      isValid: false,
      error: errorMessage || `${fieldName} is required`,
    };
  }

  return { isValid: true };
};
