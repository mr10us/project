import { useMemo } from "react";

export const useGetTotalPages = (data) => {
  const total = useMemo(() => {
    if (data && data.pages && data.pages.length > 0) {
      return data.pages[0].count;
    }
    return null;
  }, [data]);

  return total;
};
