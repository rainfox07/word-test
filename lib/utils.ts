export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDateTime(
  value: string | null | undefined,
  options?: {
    emptyText?: string;
    invalidText?: string;
  },
) {
  const emptyText = options?.emptyText ?? "暂无时间";
  const invalidText = options?.invalidText ?? "时间异常";

  if (value == null) {
    return emptyText;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return emptyText;
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return invalidText;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
