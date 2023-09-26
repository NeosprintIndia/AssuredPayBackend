export function replaceVarsInSequence(template: string, variables: string[]): string {
  let currentIndex = 0;
  return template.replace(/{#var#}/g, () => {
    if (currentIndex < variables.length) {
      const replacement = variables[currentIndex];
      currentIndex++;
      return replacement;
    }
    // If you run out of variables, keep the placeholder as is.
    console.log(template);
    return "{#var#}";
  });
}
