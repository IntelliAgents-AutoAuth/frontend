/**
 * Reusable Form Submission Hook
 * Consolidates form submission logic used in NewCase, CaseDetails, Login
 */
import { useState, useCallback } from "react";

export const useFormSubmit = (onSubmit) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setError("");
      setLoading(true);

      try {
        const result = await onSubmit();
        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail || err.message || "An error occurred";
        setError(errorMessage);
        console.error("Form submission error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [onSubmit],
  );

  const clearError = useCallback(() => setError(""), []);

  return { loading, error, handleSubmit, clearError };
};

/**
 * Reusable Form State Hook
 * Consolidates form values state used in multiple components
 */
export const useFormState = (initialValues = {}) => {
  const [formValues, setFormValues] = useState(initialValues);

  const handleInputChange = useCallback((fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const handleMultipleChanges = useCallback((changes) => {
    setFormValues((prev) => ({
      ...prev,
      ...changes,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  return {
    formValues,
    handleInputChange,
    handleMultipleChanges,
    setFormValues,
    resetForm,
  };
};

/**
 * Hook for managing form submission state for multiple fields
 */
export const useMultiFieldSubmit = () => {
  const [submitting, setSubmitting] = useState({});
  const [submitted, setSubmitted] = useState({});

  const setFieldSubmitting = useCallback((fieldName, isSubmitting) => {
    setSubmitting((prev) => ({
      ...prev,
      [fieldName]: isSubmitting,
    }));
  }, []);

  const setFieldSubmitted = useCallback((fieldName, isSubmitted) => {
    setSubmitted((prev) => ({
      ...prev,
      [fieldName]: isSubmitted,
    }));
  }, []);

  const isAnyFieldSubmitting = Object.values(submitting).some(Boolean);
  const areAllFieldsSubmitted =
    Object.keys(submitting).length > 0 &&
    Object.values(submitted).every(Boolean);

  return {
    submitting,
    submitted,
    setFieldSubmitting,
    setFieldSubmitted,
    isAnyFieldSubmitting,
    areAllFieldsSubmitted,
  };
};
