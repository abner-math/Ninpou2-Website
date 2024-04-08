import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import qs from "qs";

function valueToString<T>(value: T, isDate: boolean): string {
  if (isDate) {
    return (value as dayjs.Dayjs)?.toISOString();
  }
  return JSON.stringify(value);
}

function parseValue<T>(value: string, isDate: boolean): T {
  if (isDate) {
    return dayjs(value) as T;
  }
  return JSON.parse(value) as T;
}

export function useQueryState<T>(
  query: string,
  defaultValue: T,
  isDate = false
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
        [query]: valueToString(value, isDate),
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
    ((parsedValue && parseValue(parsedValue, isDate)) as T) || defaultValue,
    setQuery,
  ];
}
