import { useCallback, useState } from "react";

export const useHandlePagination = (fetchNextPage, hasNextPage) => {
  const [page, setPage] = useState(1);

  const handlePagination = useCallback(
    (currentPage) => {
      if (hasNextPage && currentPage % 10 === 0) {
        fetchNextPage();
      }
      setPage(currentPage);
    },
    [fetchNextPage, hasNextPage]
  );

  return { handlePagination, currentPage: page };
};
