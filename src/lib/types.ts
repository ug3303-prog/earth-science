export type RubricKey = "탐구수행" | "데이터표현" | "해석설명" | "협력태도";

export type RubricLevel = "잘함" | "보통" | "노력요함";

export interface EvaluationItem {
  level: RubricLevel;
  evidence: string;
}

export type Evaluation = Record<RubricKey, EvaluationItem> | { error: boolean } | null;

export interface Group {
  id: number;
  name: string;
  [colKey: string]: string | number; // e.g. f: "1013.2" or s: "1011.8"
}

export interface Student {
  id: number;
  name: string;
  group: string;
  answer: string;
  evaluation: Evaluation;
  approved: boolean;
  record: string | null;
}

export interface UnitData {
  count: number;
  groups: Group[];
  students: Student[];
}

export interface AppData {
  className: string;
  activeUnit: string;
  units: Record<string, UnitData>;
}
