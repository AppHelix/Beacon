/**
 * Advanced search utilities with synonym support and fuzzy matching
 */

// Technology synonyms mapping
export const TECH_SYNONYMS: Record<string, string[]> = {
  javascript: ['js', 'javascript', 'ecmascript', 'node', 'nodejs'],
  typescript: ['ts', 'typescript'],
  react: ['react', 'reactjs', 'react.js'],
  angular: ['angular', 'angularjs', 'ng'],
  vue: ['vue', 'vuejs', 'vue.js'],
  python: ['python', 'py'],
  java: ['java'],
  csharp: ['c#', 'csharp', 'dotnet', '.net'],
  azure: ['azure', 'az', 'microsoft azure'],
  aws: ['aws', 'amazon web services'],
  docker: ['docker', 'containerization'],
  kubernetes: ['kubernetes', 'k8s'],
  postgresql: ['postgresql', 'postgres', 'pg'],
  mongodb: ['mongodb', 'mongo'],
  graphql: ['graphql', 'gql'],
  rest: ['rest', 'restful', 'rest api'],
  playwright: ['playwright', 'pw'],
  testing: ['testing', 'test', 'qa', 'quality assurance'],
};

/**
 * Build synonym map for quick lookup
 */
const buildSynonymMap = (): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  Object.entries(TECH_SYNONYMS).forEach(([canonical, variants]) => {
    variants.forEach(variant => {
      map.set(variant.toLowerCase(), variants);
    });
  });
  return map;
};

const synonymMap = buildSynonymMap();

/**
 * Expand search term with synonyms
 */
export function expandWithSynonyms(term: string): string[] {
  const normalized = term.toLowerCase().trim();
  const synonyms = synonymMap.get(normalized);
  return synonyms ? [...synonyms] : [normalized];
}

/**
 * Check if text matches search term (with synonym support)
 */
export function matchesSearchTerm(
  text: string,
  searchTerm: string
): boolean {
  if (!searchTerm) return true;
  if (!text) return false;

  const normalizedText = text.toLowerCase();
  const expandedTerms = expandWithSynonyms(searchTerm);

  return expandedTerms.some(term => 
    normalizedText.includes(term.toLowerCase())
  );
}

/**
 * Search multiple fields with synonym support
 */
export function searchInFields(
  fields: (string | null | undefined)[],
  searchTerm: string
): boolean {
  if (!searchTerm) return true;
  
  return fields.some(field => 
    field && matchesSearchTerm(field, searchTerm)
  );
}

/**
 * Calculate fuzzy match score (0-1) using Levenshtein-like approach
 */
export function fuzzyMatchScore(
  str1: string,
  str2: string
): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Exact match
  if (s1 === s2) return 1;

  // Starts with
  if (s1.startsWith(s2) || s2.startsWith(s1)) return 0.9;

  // Contains
  if (s1.includes(s2) || s2.includes(s1)) return 0.7;

  // Calculate character overlap
  const set1 = new Set(s1);
  const set2 = new Set(s2);
  const intersection = new Set([...set1].filter(c => set2.has(c)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Get typeahead suggestions from a list
 */
export function getTypeaheadSuggestions<T>(
  items: T[],
  searchTerm: string,
  getFieldValue: (item: T) => string,
  maxResults: number = 10
): T[] {
  if (!searchTerm) return [];

  const scoredItems = items
    .map(item => ({
      item,
      score: fuzzyMatchScore(getFieldValue(item), searchTerm)
    }))
    .filter(({ score }) => score > 0.3) // Minimum threshold
    .sort((a, b) => b.score - a.score);

  return scoredItems.slice(0, maxResults).map(({ item }) => item);
}

/**
 * Extract unique values for facet options
 */
export function extractFacetOptions<T>(
  items: T[],
  getFieldValue: (item: T) => string | string[] | null | undefined
): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();

  items.forEach(item => {
    const value = getFieldValue(item);
    if (!value) return;

    const values = Array.isArray(value) ? value : [value];
    values.forEach(v => {
      const normalized = v.toLowerCase().trim();
      if (normalized) {
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }
    });
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Apply multiple facet filters with AND logic
 */
export function applyFacetFilters<T>(
  items: T[],
  filters: Record<string, string[]>,
  getFieldValue: (item: T, field: string) => string | string[] | null | undefined
): T[] {
  return items.filter(item => {
    return Object.entries(filters).every(([field, selectedValues]) => {
      if (selectedValues.length === 0) return true;

      const itemValue = getFieldValue(item, field);
      if (!itemValue) return false;

      const itemValues = Array.isArray(itemValue) 
        ? itemValue.map(v => v.toLowerCase()) 
        : [itemValue.toLowerCase()];

      return selectedValues.some(selected => 
        itemValues.includes(selected.toLowerCase())
      );
    });
  });
}

/**
 * Highlight matching text
 */
export function highlightMatches(
  text: string,
  searchTerm: string
): string {
  if (!searchTerm || !text) return text;

  const terms = expandWithSynonyms(searchTerm);
  let result = text;

  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  });

  return result;
}
