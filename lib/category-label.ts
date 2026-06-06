const defaultCategoryKeys: Record<string, string> = {
  Food: "category.food",
  Transport: "category.transport",
  Housing: "category.housing",
  Leisure: "category.leisure",
  Health: "category.health",
  Education: "category.education",
  Salary: "category.salary",
  Freelance: "category.freelance",
  Investments: "category.investments",
}

type Translate = (key: string) => string

export function getCategoryLabel(
  name: string,
  isGlobal: boolean | undefined,
  t: Translate
) {
  if (!isGlobal) {
    return name
  }

  const key = defaultCategoryKeys[name]
  return key ? t(key) : name
}
