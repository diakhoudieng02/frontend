// src/data/mockCourseData.ts
import { CourseWithOutputs, Exercise, Quiz, Flashcard, CourseSection, Course } from '@/types/api';

// Flashcards mockés
const mockFlashcards: Flashcard[] = [
  {
    id: 'fc1',
    question: 'Quelle est la dérivée de $f(x) = x^2$ ?',
    answer: '$f\'(x) = 2x$',
    mastered: false,
    hint: 'Pensez à la règle de puissance'
  },
  {
    id: 'fc2',
    question: 'Quelle est la formule de l\'aire d\'un cercle ?',
    answer: '$A = \\pi r^2$',
    mastered: true,
    hint: 'Rayon au carré fois pi'
  },
  {
    id: 'fc3',
    question: 'Simplifiez : $\\frac{x^2 - 1}{x - 1}$',
    answer: '$x + 1$ (pour $x \\neq 1$)',
    mastered: false
  }
];

// Exercices mockés
const mockExercises: Exercise[] = [
  {
    id: 'ex1',
    question: 'Calculez la dérivée de $f(x) = 3x^4 - 2x^2 + 5$',
    options: [
      '$f\'(x) = 12x^3 - 4x$',
      '$f\'(x) = 12x^3 - 2x$',
      '$f\'(x) = 3x^3 - 4x$',
      '$f\'(x) = 4x^3 - 2x$'
    ],
    correct_index: 0,
    explanation: 'La dérivée de $x^n$ est $nx^{n-1}$. Donc $3x^4 \\rightarrow 12x^3$, $-2x^2 \\rightarrow -4x$, et la constante $5$ donne $0$.',
    concept_tag: 'Dérivées',
    difficulty: 2
  },
  {
    id: 'ex2',
    question: 'Résolvez l\'équation : $\\sqrt{x + 5} = 3$',
    options: [
      '$x = 4$',
      '$x = 2$',
      '$x = 14$',
      '$x = 9$'
    ],
    correct_index: 0,
    explanation: 'Élevez les deux côtés au carré : $x + 5 = 9$, donc $x = 4$.',
    concept_tag: 'Équations',
    difficulty: 1
  },
  {
    id: 'ex3',
    question: 'Quelle est la limite de $\\frac{\\sin x}{x}$ quand $x \\rightarrow 0$ ?',
    options: [
      '$0$',
      '$1$',
      '$\\infty$',
      'N\'existe pas'
    ],
    correct_index: 1,
    explanation: 'C\'est une limite fondamentale en trigonométrie : $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$',
    concept_tag: 'Limites',
    difficulty: 2
  }
];

// Quiz mockés
const mockQuiz: Quiz[] = [
  {
    id: 'q1',
    question: 'Quelle est la capitale de la France ?',
    options: ['Londres', 'Paris', 'Berlin', 'Madrid'],
    correct_index: 1,
    explanation: 'Paris est la capitale de la France depuis le VIe siècle.'
  },
  {
    id: 'q2',
    question: 'Combien de côtés a un hexagone ?',
    options: ['4', '5', '6', '8'],
    correct_index: 2,
    explanation: 'Un hexagone a 6 côtés (hexa = six en grec).'
  },
  {
    id: 'q3',
    question: 'Quelle est la valeur de $\\pi$ (approximative) ?',
    options: ['3.12', '3.14', '3.16', '3.18'],
    correct_index: 1,
    explanation: '$\\pi \\approx 3.14159...$'
  }
];

// Concepts clés
const mockKeyConcepts: string[] = [
  'Dérivées : taux de variation instantané',
  'Intégrales : aire sous la courbe',
  'Limites : comportement asymptotique',
  'Trigonométrie : relations entre angles et côtés',
  'Logarithmes : fonctions inverses des exponentielles'
];

// Structure du cours
const mockStructure: CourseSection[] = [
  { id: 'introduction', title: 'Introduction', level: 'h2' },
  { id: 'derivées', title: 'Les dérivées', level: 'h2' },
  { id: 'dérivées-simples', title: 'Dérivées simples', level: 'h3' },
  { id: 'dérivées-composées', title: 'Dérivées de fonctions composées', level: 'h3' },
  { id: 'intégrales', title: 'Les intégrales', level: 'h2' },
  { id: 'méthodes-intégration', title: 'Méthodes d\'intégration', level: 'h3' },
  { id: 'conclusion', title: 'Conclusion', level: 'h2' }
];

// Résumé en markdown
const mockSummary = `
# Introduction au Calcul Différentiel

## Introduction

Le calcul différentiel est une branche fondamentale des mathématiques qui étudie les taux de variation. Il a été développé indépendamment par **Newton** et **Leibniz** au 17ème siècle.

## Les dérivées

### Dérivées simples

La dérivée d'une fonction $f(x)$ mesure son taux de variation instantané. Pour une fonction $f(x) = x^n$, la dérivée est :

$$\\frac{d}{dx}(x^n) = nx^{n-1}$$

**Exemples :**
- $f(x) = x^2 \\rightarrow f'(x) = 2x$
- $f(x) = x^3 \\rightarrow f'(x) = 3x^2$

### Dérivées de fonctions composées

Pour une fonction composée $f(g(x))$, on utilise la règle de la chaîne :

$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$

## Les intégrales

### Méthodes d'intégration

L'intégrale est l'opération inverse de la dérivée. Pour une fonction $f(x) = x^n$ :

$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C, \\quad n \\neq -1$$

## Conclusion

Le calcul différentiel est essentiel pour :
- La physique (vitesse, accélération)
- L'économie (coûts marginaux)
- L'optimisation (maximisation de profits)
`;

// Cours complet avec outputs
export const mockCourseWithOutputs: CourseWithOutputs = {
  id: 'mock-full',
  title: 'Calcul Différentiel - Niveau Terminale',
  subject: 'math',
  fileUrl: 'https://example.com/course.pdf',
  downloadUrl: 'https://example.com/course.pdf',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  userId: 'user-123',
  status: 'ready',
  outputs: {
    summary: mockSummary,
    keyConcepts: mockKeyConcepts,
    flashcards: mockFlashcards,
    structure: mockStructure,
    exercises: mockExercises,
    quiz: mockQuiz
  }
};

// Version sans outputs (pour tester l'état de génération)
export const mockCourseWithoutOutputs: CourseWithOutputs = {
  id: 'mock-empty',
  title: 'Introduction à la Physique Quantique',
  subject: 'math',
  fileUrl: 'https://example.com/physics.pdf',
  downloadUrl: 'https://example.com/physics.pdf',
  createdAt: '2024-02-01T09:00:00Z',
  updatedAt: '2024-02-01T09:00:00Z',
  userId: 'user-123',
  status: 'processing',
  outputs: undefined
};

// Version avec seulement quelques outputs
export const mockCoursePartialOutputs: CourseWithOutputs = {
  id: 'mock-partial',
  title: 'Algèbre Linéaire',
  subject: 'math',
  fileUrl: 'https://example.com/algebra.pdf',
  downloadUrl: 'https://example.com/algebra.pdf',
  createdAt: '2024-01-25T11:00:00Z',
  updatedAt: '2024-01-26T16:20:00Z',
  userId: 'user-123',
  status: 'ready',
  outputs: {
    summary: '# Algèbre Linéaire\n\n## Vecteurs\n\nUn vecteur est un objet mathématique qui possède une direction et une magnitude.\n\n## Matrices\n\nUne matrice est un tableau rectangulaire de nombres.',
    keyConcepts: ['Vecteurs', 'Matrices', 'Déterminants'],
    flashcards: mockFlashcards.slice(0, 2),
    structure: [
      { id: 'vecteurs', title: 'Vecteurs', level: 'h2' },
      { id: 'matrices', title: 'Matrices', level: 'h2' }
    ],
    exercises: mockExercises.slice(0, 1),
    quiz: undefined
  }
};

// Mapping des IDs vers les données mockées
export const mockCoursesMap: Record<string, CourseWithOutputs> = {
  'mock-full': mockCourseWithOutputs,
  'mock-empty': mockCourseWithoutOutputs,
  'mock-partial': mockCoursePartialOutputs
};
// src/data/mockCourseData.ts (ajouter à la fin du fichier)

// Liste de cours pour la page principale
export const mockCoursesList: Course[] = [
  {
    id: 'mock-full',
    title: 'Calcul Différentiel - Niveau Terminale',
    subject: 'math',
    fileUrl: 'https://example.com/course.pdf',
    downloadUrl: 'https://example.com/course.pdf',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    userId: 'user-123',
    status: 'ready'
  },
  {
    id: 'mock-partial',
    title: 'Algèbre Linéaire - Matrices et Vecteurs',
    subject: 'math',
    fileUrl: 'https://example.com/algebra.pdf',
    downloadUrl: 'https://example.com/algebra.pdf',
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-26T16:20:00Z',
    userId: 'user-123',
    status: 'ready'
  },
  {
    id: 'mock-empty',
    title: 'Introduction à la Physique Quantique',
    subject: 'math',
    fileUrl: 'https://example.com/physics.pdf',
    downloadUrl: 'https://example.com/physics.pdf',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
    userId: 'user-123',
    status: 'processing'
  },
  {
    id: 'mock-english-1',
    title: 'English Grammar - Present Perfect',
    subject: 'Langues',
    fileUrl: 'https://example.com/english.pdf',
    downloadUrl: 'https://example.com/english.pdf',
    createdAt: '2024-02-05T14:00:00Z',
    updatedAt: '2024-02-06T10:15:00Z',
    userId: 'user-123',
    status: 'ready'
  },
  {
    id: 'mock-english-2',
    title: 'English Vocabulary - Business English',
    subject: 'Langues',
    fileUrl: 'https://example.com/business-english.pdf',
    downloadUrl: 'https://example.com/business-english.pdf',
    createdAt: '2024-02-10T09:30:00Z',
    updatedAt: '2024-02-11T11:45:00Z',
    userId: 'user-123',
    status: 'ready'
  },
  {
    id: 'mock-math-advanced',
    title: 'Trigonométrie - Formules et Applications',
    subject: 'math',
    fileUrl: 'https://example.com/trigonometry.pdf',
    downloadUrl: 'https://example.com/trigonometry.pdf',
    createdAt: '2024-02-12T13:20:00Z',
    updatedAt: '2024-02-13T15:30:00Z',
    userId: 'user-123',
    status: 'ready'
  },
  {
    id: 'mock-french-1',
    title: 'Grammaire Française - Le Subjonctif',
    subject: 'Langues',
    fileUrl: 'https://example.com/french.pdf',
    downloadUrl: 'https://example.com/french.pdf',
    createdAt: '2024-02-15T16:00:00Z',
    updatedAt: '2024-02-16T09:00:00Z',
    userId: 'user-123',
    status: 'ready'
  }
];