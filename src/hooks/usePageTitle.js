/**
 * Page Title Hook
 * Consolidates document.title setting used in 6+ pages
 */
import { useEffect } from "react";

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title || "AutoAuth";

    return () => {
      document.title = "AutoAuth";
    };
  }, [title]);
};
