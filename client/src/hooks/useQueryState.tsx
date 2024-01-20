import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import qs from "qs";

function valueToString<T>(value: T): string {
  return JSON.stringify(value);
}

function parseValue<T>(value: string): T {
  return JSON.parse(value) as T;
}

export function useQueryState<T>(
  query: string,
  defaultValue: T
): [T, (updaterOrValue: T | ((old: T) => T)) => void] {
  const location = useLocation();
  const navigate = useNavigate();

  const setQuery = useCallback(
    (value: T | ((old: T) => T)) => {
      const existingQueries = qs.parse(location.search, {
        ignoreQueryPrefix: true,
      });
      const newQueries = {
        ...existingQueries,
        [query]: valueToString(value),
      };
      const queryString = qs.stringify(newQueries, { skipNulls: true });
      navigate({ search: queryString });
    },
    [history, location, query]
  );

  const parsedValue = qs.parse(location.search, { ignoreQueryPrefix: true })[
    query
  ] as string;
  return [
    ((parsedValue && parseValue(parsedValue)) as T) || defaultValue,
    setQuery,
  ];
}
