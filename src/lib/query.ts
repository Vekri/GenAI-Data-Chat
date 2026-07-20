import { z } from "zod";
import type { ResultTable } from "./types";

const AggSchema = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return "none";
  const s = String(v).toLowerCase();
  if (s === "count_distinct" || s === "count(*)") return "count";
  return s;
}, z.enum(["none", "count", "sum", "avg", "min", "max"]));

const OpSchema = z.preprocess((v) => {
  const s = String(v ?? "eq").toLowerCase();
  const map: Record<string, string> = {
    "=": "eq",
    "==": "eq",
    "!=": "neq",
    "<>": "neq",
    ">": "gt",
    ">=": "gte",
    "<": "lt",
    "<=": "lte",
    like: "contains",
    ilike: "contains",
  };
  return map[s] ?? s;
}, z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "contains"]));

const SelectItemSchema = z.object({
  column: z.preprocess((v) => {
    if (v === undefined || v === null || v === "" || v === "*") return null;
    return String(v);
  }, z.string().nullable()),
  agg: AggSchema.default("none"),
  as: z.string().optional(),
});

const WhereItemSchema = z.object({
  column: z.string(),
  op: OpSchema.default("eq"),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

const OrderItemSchema = z.object({
  column: z.string(),
  dir: z.preprocess((v) => {
    const s = String(v ?? "asc").toLowerCase();
    return s.startsWith("desc") ? "desc" : "asc";
  }, z.enum(["asc", "desc"])),
});

export const QueryPlanSchema = z.object({
  select: z.array(SelectItemSchema).min(1),
  where: z.array(WhereItemSchema).default([]),
  groupBy: z.array(z.string()).default([]),
  orderBy: z.array(OrderItemSchema).default([]),
  limit: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return 50;
    if (v === "null") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : 50;
  }, z.number().int().positive().max(200).nullable()),
});

export type QueryPlan = z.infer<typeof QueryPlanSchema>;

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function matches(
  row: Record<string, unknown>,
  where: QueryPlan["where"],
): boolean {
  return where.every((clause) => {
    const left = row[clause.column];
    const right = clause.value;

    switch (clause.op) {
      case "eq":
        return left === right || String(left) === String(right);
      case "neq":
        return !(left === right || String(left) === String(right));
      case "gt":
        return compare(left, right) > 0;
      case "gte":
        return compare(left, right) >= 0;
      case "lt":
        return compare(left, right) < 0;
      case "lte":
        return compare(left, right) <= 0;
      case "contains":
        return String(left ?? "")
          .toLowerCase()
          .includes(String(right ?? "").toLowerCase());
      default:
        return false;
    }
  });
}

function aggregate(values: unknown[], agg: QueryPlan["select"][number]["agg"]) {
  const nums = values
    .map((v) => (typeof v === "number" ? v : Number(v)))
    .filter((v) => Number.isFinite(v));

  switch (agg) {
    case "count":
      return values.filter((v) => v !== null && v !== undefined).length;
    case "sum":
      return nums.reduce((a, b) => a + b, 0);
    case "avg":
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    case "min":
      return nums.length ? Math.min(...nums) : null;
    case "max":
      return nums.length ? Math.max(...nums) : null;
    default:
      return values[0] ?? null;
  }
}

export function describePlan(plan: QueryPlan): string {
  const select = plan.select
    .map((s) => {
      const label =
        s.as ||
        (s.agg === "none" ? s.column : `${s.agg}(${s.column ?? "*"})`);
      return s.agg === "none"
        ? String(s.column)
        : `${s.agg.toUpperCase()}(${s.column ?? "*"}) AS ${label}`;
    })
    .join(", ");
  const where =
    plan.where.length === 0
      ? ""
      : " WHERE " +
        plan.where
          .map((w) => `${w.column} ${w.op} ${JSON.stringify(w.value)}`)
          .join(" AND ");
  const group =
    plan.groupBy.length === 0 ? "" : ` GROUP BY ${plan.groupBy.join(", ")}`;
  const order =
    plan.orderBy.length === 0
      ? ""
      : " ORDER BY " +
        plan.orderBy.map((o) => `${o.column} ${o.dir.toUpperCase()}`).join(", ");
  const limit = plan.limit ? ` LIMIT ${plan.limit}` : "";
  return `SELECT ${select} FROM data${where}${group}${order}${limit}`;
}

export function runQueryPlan(
  planInput: QueryPlan,
  rows: Record<string, unknown>[],
): ResultTable {
  const plan = QueryPlanSchema.parse(planInput);
  const filtered = rows.filter((row) => matches(row, plan.where));
  const hasAgg = plan.select.some((s) => s.agg !== "none");
  const groupBy = plan.groupBy;

  let resultRows: Record<string, unknown>[] = [];

  if (hasAgg || groupBy.length > 0) {
    const groups = new Map<string, Record<string, unknown>[]>();
    for (const row of filtered) {
      const key = groupBy.map((g) => JSON.stringify(row[g])).join("|");
      const bucket = groups.get(key) ?? [];
      bucket.push(row);
      groups.set(key, bucket);
    }

    for (const bucket of groups.values()) {
      const out: Record<string, unknown> = {};
      for (const g of groupBy) {
        out[g] = bucket[0]?.[g] ?? null;
      }
      for (const s of plan.select) {
        const name =
          s.as ||
          (s.agg === "none"
            ? String(s.column)
            : `${s.agg}_${s.column ?? "all"}`);
        if (s.agg === "none") {
          out[name] = s.column ? (bucket[0]?.[s.column] ?? null) : null;
        } else {
          const values = s.column
            ? bucket.map((r) => r[s.column as string])
            : bucket;
          out[name] = aggregate(values, s.agg);
        }
      }
      resultRows.push(out);
    }
  } else {
    resultRows = filtered.map((row) => {
      const out: Record<string, unknown> = {};
      for (const s of plan.select) {
        const name = s.as || String(s.column);
        out[name] = s.column ? (row[s.column] ?? null) : null;
      }
      return out;
    });
  }

  if (plan.orderBy.length) {
    resultRows.sort((a, b) => {
      for (const o of plan.orderBy) {
        const cmp = compare(a[o.column], b[o.column]);
        if (cmp !== 0) return o.dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }

  if (plan.limit) {
    resultRows = resultRows.slice(0, plan.limit);
  }

  const columns =
    resultRows.length > 0
      ? Object.keys(resultRows[0])
      : plan.select.map(
          (s) =>
            s.as ||
            (s.agg === "none"
              ? String(s.column)
              : `${s.agg}_${s.column ?? "all"}`),
        );

  return { columns, rows: resultRows };
}
