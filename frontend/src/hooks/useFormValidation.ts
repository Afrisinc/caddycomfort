import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { errorMessage } from '@/lib/utils';

export type FormValues = Record<string, string>;
export type FormErrors<T extends FormValues> = Partial<Record<keyof T, string>>;

interface FormValidationOptions<T extends FormValues> {
  readonly initialValues: T;
  readonly validate: (values: T) => FormErrors<T>;
  readonly idPrefix: string;
}

export function useFormValidation<T extends FormValues>({
  initialValues,
  validate,
  idPrefix,
}: FormValidationOptions<T>) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => validate(values), [validate, values]);

  const fieldId = useCallback((name: keyof T) => `${idPrefix}-${String(name)}`, [idPrefix]);

  const setValue = useCallback((name: keyof T, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const touch = useCallback((name: keyof T) => {
    setTouched((current) => ({ ...current, [name]: true }));
  }, []);

  const field = useCallback(
    (name: keyof T) => ({
      id: fieldId(name),
      name: String(name),
      value: values[name],
      error: touched[name] ? errors[name] : undefined,
      onChange: (event: ChangeEvent<HTMLInputElement>) => setValue(name, event.target.value),
      onBlur: () => touch(name),
    }),
    [errors, fieldId, setValue, touch, touched, values],
  );

  const handleSubmit = useCallback(
    (onValid: (values: T) => Promise<void> | void, fallbackError: string) =>
      async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const names = Object.keys(values) as (keyof T)[];
        setTouched(Object.fromEntries(names.map((name) => [name, true])) as typeof touched);

        const firstInvalid = names.find((name) => errors[name]);
        if (firstInvalid) {
          document.getElementById(fieldId(firstInvalid))?.focus();
          return;
        }

        setFormError(null);
        setSubmitting(true);
        try {
          await onValid(values);
        } catch (error) {
          setFormError(errorMessage(error, fallbackError));
        } finally {
          setSubmitting(false);
        }
      },
    [errors, fieldId, values],
  );

  const reset = useCallback(
    (next: Partial<T> = {}) => {
      setValues({ ...initialValues, ...next });
      setTouched({});
      setFormError(null);
    },
    [initialValues],
  );

  return useMemo(
    () => ({
      values,
      errors,
      formError,
      submitting,
      field,
      fieldId,
      setValue,
      touch,
      setFormError,
      handleSubmit,
      reset,
    }),
    [values, errors, formError, submitting, field, fieldId, setValue, touch, handleSubmit, reset],
  );
}
