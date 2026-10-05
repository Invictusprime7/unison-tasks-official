/** Portable variants have one renderer. Legacy callers must use canonical compilation. */
export function portableRecipeOnly(): never {
  throw new Error('This variant requires canonical portable-recipe compilation.');
}
