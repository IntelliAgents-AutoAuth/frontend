/**
 * Reusable Data Fetching Hook
 * Consolidates identical fetch pattern used in Dashboard, CasesData, EhrPrefill
 */
import { useState, useEffect } from "react";

export const useFetchData = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        console.error("Data fetch failed:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, dependencies);

  const retry = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error("Data fetch failed:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, retry };
};

/**
 * Specialized hook for fetching cases list
 */
export const useFetchCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        setError(null);
        const { casesApi } = require("../api/api");
        const data = await casesApi.fetchCases();
        setCases(data || []);
      } catch (err) {
        console.error("Failed to fetch cases:", err);
        setError(err.message || "Failed to load cases");
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  return { cases, loading, error };
};

/**
 * Specialized hook for fetching single case
 */
export const useFetchCase = (caseId) => {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!caseId) {
      setLoading(false);
      return;
    }

    const loadCase = async () => {
      try {
        setLoading(true);
        setError(null);
        const { casesApi } = require("../api/api");
        const data = await casesApi.fetchCaseById(caseId);
        setCaseData(data);
      } catch (err) {
        console.error("Failed to fetch case:", err);
        setError(err.message || "Failed to load case");
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId]);

  return { caseData, loading, error };
};
