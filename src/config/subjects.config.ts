// src/config/subjects.config.ts
// ═══════════════════════════════════════════════════════════
// ✅ SOURCE UNIQUE — Ajouter une matière ici suffit pour
//    l'intégrer partout dans l'application.
//
// ⚠️  Les valeurs `value` doivent correspondre EXACTEMENT
//     à ce qu'accepte le backend. Ne pas les modifier.
//     Valeurs acceptées : math, Langues, sciences, histoire, geographie
// ═══════════════════════════════════════════════════════════

export const SUBJECTS = [
  {
    value: 'math',
    label: 'Mathématiques',
    emoji: '📐',
    filterGradient: 'from-blue-500 to-cyan-500',
    badgeClass: 'bg-blue-100 text-blue-700',
    iconClass: 'bg-blue-100 text-blue-600',
  },
  {
    value: 'Langues',
    label: 'Langues',
    emoji: '🗣️',
    filterGradient: 'from-green-500 to-emerald-500',
    badgeClass: 'bg-green-100 text-green-700',
    iconClass: 'bg-green-100 text-green-600',
  },
  {
    value: 'sciences',
    label: 'Sciences',
    emoji: '⚗️',
    filterGradient: 'from-orange-500 to-red-500',
    badgeClass: 'bg-orange-100 text-orange-700',
    iconClass: 'bg-orange-100 text-orange-600',
  },
  {
    value: 'histoire',
    label: 'Histoire',
    emoji: '📜',
    filterGradient: 'from-amber-500 to-yellow-500',
    badgeClass: 'bg-amber-100 text-amber-700',
    iconClass: 'bg-amber-100 text-amber-600',
  },
  {
    value: 'geographie',
    label: 'Géographie',
    emoji: '🌍',
    filterGradient: 'from-teal-500 to-green-500',
    badgeClass: 'bg-teal-100 text-teal-700',
    iconClass: 'bg-teal-100 text-teal-600',
  },
] as const;

// ─── Type CourseSubject dérivé automatiquement ────────────
export type CourseSubject = (typeof SUBJECTS)[number]['value'];

// ─── Map value → config, accès O(1) ──────────────────────
export const SUBJECT_MAP = Object.fromEntries(
  SUBJECTS.map((s) => [s.value, s])
) as Record<CourseSubject, (typeof SUBJECTS)[number]>;

// ─── Helpers utilisés dans les composants ─────────────────

export function getSubjectLabel(value: string): string {
  return SUBJECT_MAP[value as CourseSubject]?.label ?? value;
}

export function getSubjectEmoji(value: string): string {
  return SUBJECT_MAP[value as CourseSubject]?.emoji ?? '📚';
}

export function getSubjectBadgeClass(value: string): string {
  return SUBJECT_MAP[value as CourseSubject]?.badgeClass ?? 'bg-gray-100 text-gray-700';
}

export function getSubjectIconClass(value: string): string {
  return SUBJECT_MAP[value as CourseSubject]?.iconClass ?? 'bg-gray-100 text-gray-600';
}