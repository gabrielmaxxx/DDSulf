import { useState, useEffect, useCallback } from 'react';

export interface FormStateOptions<T> {
  draftKey?: string;
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
}

export function useFormState<T>(options: FormStateOptions<T>) {
  const [values, setValues] = useState<T>(() => {
    if (options.draftKey && typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(`form_draft_${options.draftKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Could not parse form draft:', e);
        }
      }
    }
    return options.initialValues;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save drafts
  useEffect(() => {
    if (options.draftKey && typeof window !== 'undefined' && isDirty) {
      window.localStorage.setItem(`form_draft_${options.draftKey}`, JSON.stringify(values));
    }
  }, [values, options.draftKey, isDirty]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  }, []);

  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setValues(options.initialValues);
    setErrors({});
    setIsDirty(false);
    if (options.draftKey && typeof window !== 'undefined') {
      window.localStorage.removeItem(`form_draft_${options.draftKey}`);
    }
  }, [options.initialValues, options.draftKey]);

  const validate = useCallback(() => {
    if (options.validate) {
      const validationErrors = options.validate(values);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }
    return true;
  }, [values, options.validate]);

  return {
    values,
    errors,
    isDirty,
    handleChange,
    setValues: setFormValues,
    reset: resetForm,
    validate,
  };
}

export default useFormState;
