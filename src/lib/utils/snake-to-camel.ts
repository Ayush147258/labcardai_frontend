// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — snake_case → camelCase converter
// Python backend returns snake_case; TypeScript frontend uses camelCase.
// Deep recursive — handles nested objects and arrays.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively convert all object keys from snake_case → camelCase.
 *
 * Examples:
 *   health_score      → healthScore
 *   patient_name      → patientName
 *   bio_age_protocol  → bioAgeProtocol
 *   has_critical_alert → hasCriticalAlert
 *   indian_foods      → indianFoods
 *   explanation_hindi → explanationHindi
 */
export function snakeToCamel(obj: unknown): unknown {
  // Recurse into arrays
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  // Recurse into plain objects
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        toCamelKey(key),
        snakeToCamel(value),
      ])
    );
  }

  // Primitive — return as-is
  return obj;
}

/**
 * Convert a single snake_case key → camelCase.
 * Handles consecutive underscores and leading underscores gracefully.
 *
 * "health_score"       → "healthScore"
 * "bio_age_protocol"   → "bioAgeProtocol"
 * "value_raw"          → "valueRaw"
 * "normal_range_text"  → "normalRangeText"
 */
function toCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

/**
 * Inverse: camelCase → snake_case (used when sending data to backend).
 * Used internally by chatWithBackend (report_data field).
 */
export function camelToSnake(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        key.replace(/([A-Z])/g, '_$1').toLowerCase(),
        camelToSnake(value),
      ])
    );
  }
  return obj;
}
