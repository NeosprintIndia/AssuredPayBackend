export function replaceVarsInSequence(template: string, variables: string[]): string {
  let currentIndex = 0;
  return template.replace(/{#var#}/g, () => {
    if (currentIndex < variables.length) {
      const replacement = variables[currentIndex];
      currentIndex++;
      return replacement;
    }
    return "{#var#}";
  });
}
