import { Router, Request } from "express";
import { SelectQueryBuilder, ObjectLiteral } from "typeorm";
import { Game } from "../entities/game";
import { Ladder } from "../entities/ladder";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      ladder: Ladder | null | undefined;
      game: Game | null | undefined;
      getQueryString: (
        key: string,
        defaultValue?: string
      ) => string | undefined;
      getQueryInt: (key: string, defaultValue?: number) => number | undefined;
    }
  }
}

const router = Router();
router.use((req, res, next) => {
  if (req.body.payload) {
    req.body = JSON.parse(req.body.payload);
  }
  req.getQueryString = (
    key: string,
    defaultValue?: string
  ): string | undefined => {
    return (
      (typeof req.query[key] === "string" && (req.query[key] as string)) ||
      defaultValue
    );
  };
  req.getQueryInt = (
    key: string,
    defaultValue?: number
  ): number | undefined => {
    return (
      (typeof req.query[key] === "string" &&
        parseInt(req.query[key] as string)) ||
      defaultValue
    );
  };
  next();
});

export function filterQueryFromRequest<T extends ObjectLiteral>(
  req: Request,
  options: {
    query: SelectQueryBuilder<T>;
    filterColumns: { name: string; type: string; alias: string }[];
    sortColumns: { name: string; alias: string }[];
  }
): [boolean, boolean] {
  const { query, filterColumns, sortColumns } = options;
  const filters =
    (req.query.filters && JSON.parse(req.query.filters as string)) || [];
  const sorting =
    (req.query.sorting && JSON.parse(req.query.sorting as string)) || [];
  let isPublicLadder = false;
  for (const requestFilter of filters) {
    for (const filterColumn of filterColumns) {
      if (requestFilter.id !== filterColumn.name || !requestFilter.value) {
        continue;
      }
      switch (filterColumn.type) {
        case "date":
          if (requestFilter.value[0] && requestFilter.value[1]) {
            query
              .andWhere(`${filterColumn.alias} BETWEEN :start AND :end`)
              .setParameter("start", requestFilter.value[0])
              .setParameter("end", requestFilter.value[1]);
          } else if (requestFilter.value[0]) {
            query
              .andWhere(`${filterColumn.alias} >= :start`)
              .setParameter("start", requestFilter.value[0]);
          } else if (requestFilter.value[1]) {
            query
              .andWhere(`${filterColumn.alias} <= :end`)
              .setParameter("end", requestFilter.value[1]);
          }
          break;
        case "enum":
          query
            .andWhere(`${filterColumn.alias} LIKE :${requestFilter.id}`)
            .setParameter(
              requestFilter.id,
              `%${requestFilter.value.replace(" ", "_").toUpperCase()}%`
            );
          break;
        case "boolean":
          query
            .andWhere(`${filterColumn.alias} = :${requestFilter.id}`)
            .setParameter(requestFilter.id, requestFilter.value === "true");
          break;
        case "string":
          query
            .andWhere(`${filterColumn.alias} LIKE :${requestFilter.id}`)
            .setParameter(requestFilter.id, `%${requestFilter.value}%`);
          break;
        case "array":
          if (
            requestFilter.id === "ladder" &&
            requestFilter.value === "public"
          ) {
            isPublicLadder = true;
            continue;
          }
          query
            .andWhere(`${filterColumn.alias} @> ARRAY[:${requestFilter.id}]`)
            .setParameter(requestFilter.id, requestFilter.value.toLowerCase());
          break;
      }
    }
  }
  let hasSorting = false;
  for (const sort of sorting) {
    for (const sortColumn of sortColumns) {
      if (sort.id === sortColumn.name) {
        query.orderBy(sortColumn.alias, sort.desc ? "DESC" : "ASC");
        hasSorting = true;
      }
    }
  }
  return [hasSorting, isPublicLadder];
}

export default router;
