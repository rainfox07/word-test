export function normalizeMeaningText(value: string) {
  return value
    .split(/\s*[;；\/、|]\s*/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" / ");
}

export function splitMeanings(value: string) {
  return value
    .split(/\s*\/\s*/g)
    .map((item) => item.trim())
    .filter(Boolean);
}
