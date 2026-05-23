export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

function fail(...errors: string[]): ValidationResult {
  return { valid: false, errors };
}

function requireArray(data: unknown, name: string): ValidationResult {
  if (!Array.isArray(data)) {
    return fail(`Expected an array at root, got ${typeof data}. "${name}" must be a JSON array.`);
  }
  if (data.length === 0) {
    return fail(`The array is empty. At least one record is required.`);
  }
  return ok();
}

function checkFields(
  item: Record<string, unknown>,
  required: string[][],
  datasetName: string,
  index: number,
): string[] {
  const errors: string[] = [];
  for (const aliases of required) {
    const found = aliases.some((k) => item[k] !== undefined && item[k] !== null && item[k] !== "");
    if (!found) {
      const label = aliases.join(" or ");
      errors.push(
        `Record at index ${index} in "${datasetName}" is missing required field: ${label}.`,
      );
    }
  }
  return errors;
}

export function validateCutoffs(data: unknown): ValidationResult {
  const check = requireArray(data, "cutoffs");
  if (!check.valid) return check;

  const arr = data as Record<string, unknown>[];
  const REQUIRED: string[][] = [
    ["college", "institute", "instituteName", "collegeCode", "collegeName"],
    ["branch", "program", "courseName", "programName", "branchName"],
    ["category", "quota"],
    ["rank", "openingRank", "closingRank", "cutoffRank", "openRank", "closeRank"],
  ];

  const errors: string[] = [];
  const sampleSize = Math.min(arr.length, 5);
  for (let i = 0; i < sampleSize; i++) {
    if (typeof arr[i] !== "object" || arr[i] === null) {
      errors.push(`Record at index ${i} is not an object.`);
      continue;
    }
    errors.push(...checkFields(arr[i], REQUIRED, "cutoffs", i));
  }

  if (errors.length > 0) {
    const found = Object.keys(arr[0] ?? {}).join(", ");
    errors.unshift(
      `Cutoffs validation failed. Found keys: [${found}]. Expected: collegeName/college/institute, branchName/branch/program, category/quota, openingRank/closingRank/rank.`,
    );
    return { valid: false, errors };
  }
  return ok();
}

export function validatePredictor(data: unknown): ValidationResult {
  const check = requireArray(data, "predictor");
  if (!check.valid) return check;

  const arr = data as Record<string, unknown>[];
  const REQUIRED: string[][] = [
    ["rank", "jeeRank", "openingRank", "closingRank"],
  ];

  const errors: string[] = [];
  const sampleSize = Math.min(arr.length, 5);
  for (let i = 0; i < sampleSize; i++) {
    if (typeof arr[i] !== "object" || arr[i] === null) {
      errors.push(`Record at index ${i} is not an object.`);
      continue;
    }
    errors.push(...checkFields(arr[i], REQUIRED, "predictor", i));
  }

  if (errors.length > 0) {
    errors.unshift(`Predictor validation failed. Each record must include a rank-related field.`);
    return { valid: false, errors };
  }
  return ok();
}

export function validateSimulator(data: unknown): ValidationResult {
  const check = requireArray(data, "simulator");
  if (!check.valid) return check;

  const arr = data as Record<string, unknown>[];
  const REQUIRED: string[][] = [
    ["college", "institute", "instituteName", "collegeCode"],
    ["branch", "program", "courseName"],
  ];

  const errors: string[] = [];
  const sampleSize = Math.min(arr.length, 5);
  for (let i = 0; i < sampleSize; i++) {
    if (typeof arr[i] !== "object" || arr[i] === null) {
      errors.push(`Record at index ${i} is not an object.`);
      continue;
    }
    errors.push(...checkFields(arr[i], REQUIRED, "simulator", i));
  }

  if (errors.length > 0) {
    errors.unshift(`Simulator validation failed. Each record must include college/institute and branch/program fields.`);
    return { valid: false, errors };
  }
  return ok();
}

export function validateColleges(data: unknown): ValidationResult {
  const check = requireArray(data, "colleges");
  if (!check.valid) return check;

  const arr = data as Record<string, unknown>[];
  const REQUIRED: string[][] = [
    ["name", "shortName", "instituteName", "collegeName"],
    ["type", "instituteType", "collegeType"],
    ["state", "location"],
  ];

  const errors: string[] = [];
  const sampleSize = Math.min(arr.length, 5);
  for (let i = 0; i < sampleSize; i++) {
    if (typeof arr[i] !== "object" || arr[i] === null) {
      errors.push(`Record at index ${i} is not an object.`);
      continue;
    }
    errors.push(...checkFields(arr[i], REQUIRED, "colleges", i));
  }

  if (errors.length > 0) {
    errors.unshift(`Colleges validation failed. Expected fields: name/shortName, type/instituteType, state/location.`);
    return { valid: false, errors };
  }
  return ok();
}

export function validateAbout(data: unknown): ValidationResult {
  if (data === null || data === undefined) {
    return fail(`About data cannot be null or empty.`);
  }
  if (typeof data !== "object" && !Array.isArray(data)) {
    return fail(`About data must be a JSON object or array, got ${typeof data}.`);
  }
  return ok();
}

export function validateSchedule(data: unknown): ValidationResult {
  const check = requireArray(data, "schedule");
  if (!check.valid) return check;

  const arr = data as Record<string, unknown>[];
  const REQUIRED: string[][] = [
    ["round", "roundNumber", "roundNo"],
    ["startDate", "start", "startOn"],
    ["endDate", "end", "endOn"],
  ];

  const errors: string[] = [];
  const sampleSize = Math.min(arr.length, 5);
  for (let i = 0; i < sampleSize; i++) {
    if (typeof arr[i] !== "object" || arr[i] === null) {
      errors.push(`Record at index ${i} is not an object.`);
      continue;
    }
    errors.push(...checkFields(arr[i], REQUIRED, "schedule", i));

    const item = arr[i];
    const startVal = item.startDate ?? item.start ?? item.startOn;
    const endVal = item.endDate ?? item.end ?? item.endOn;
    if (startVal && isNaN(Date.parse(String(startVal)))) {
      errors.push(`Record at index ${i}: startDate "${startVal}" is not a valid date.`);
    }
    if (endVal && isNaN(Date.parse(String(endVal)))) {
      errors.push(`Record at index ${i}: endDate "${endVal}" is not a valid date.`);
    }
  }

  if (errors.length > 0) {
    errors.unshift(`Schedule validation failed. Each record must include round number, startDate, and endDate.`);
    return { valid: false, errors };
  }
  return ok();
}
