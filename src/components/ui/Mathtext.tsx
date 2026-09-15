// components/ui/MathText.tsx
//
// Prérequis :
//   npm install react-katex katex
//   npm install --save-dev @types/katex
//   import 'katex/dist/katex.min.css'; dans main.tsx

import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Convertit une notation math brute en LaTeX valide.
 * Ex : "x^2"     → "x^{2}"
 *      "x^(n-1)" → "x^{n-1}"
 *      "1/3"     → "\frac{1}{3}"
 */
function toLatex(expr: string): string {
  return expr
    // x^(n-1) ou x^(n) → x^{n-1} ou x^{n}
    .replace(/\^\(([^)]+)\)/g, '^{$1}')
    // x^2 ou x^n (exposant simple) → x^{2} x^{n}
    .replace(/\^([^{(\s,;!?])/g, '^{$1}')
    // x_(0) → x_{0}
    .replace(/_\(([^)]+)\)/g, '_{$1}')
    // x_0 → x_{0}
    .replace(/_([^{(\s,;!?])/g, '_{$1}')
    // 1/3 (fraction entière) → \frac{1}{3}
    .replace(/\b(\d+)\/(\d+)\b/g, '\\frac{$1}{$2}');
}

/**
 * Vérifie qu'une chaîne est une expression mathématique
 * (contient ^, _, fraction) et n'a pas de lettres accentuées.
 */
function isMathExpression(text: string): boolean {
  if (/[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(text)) return false;
  return /[a-zA-Z0-9]\^|[a-zA-Z]\(|\d+\/\d+/.test(text);
}

/**
 * Découpe un texte en segments texte/math.
 *
 * Cas 1 — délimiteurs $ présents : parser classique $...$ / $$...$$
 * Cas 2 — pas de $ : détection automatique des expressions math brutes
 *   Exemples détectés :
 *     f(x) = x^3       → math
 *     3x^2             → math
 *     (x^n)' = nx^{n-1} → math
 *     x^(n-1)          → math
 *   Exemples NON touchés :
 *     "quelle est"     → texte
 *     "dérivée"        → texte (accent)
 *     "n=3"            → math
 */
function parseSegments(text: string): Array<{ type: 'text' | 'block' | 'inline'; content: string }> {
  const segments: Array<{ type: 'text' | 'block' | 'inline'; content: string }> = [];

  // ── Cas 1 : délimiteurs $ présents ─────────────────────────────────────────
  if (text.includes('$')) {
    const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      if (match[1] !== undefined) {
        segments.push({ type: 'block', content: match[1].trim() });
      } else if (match[2] !== undefined) {
        segments.push({ type: 'inline', content: match[2].trim() });
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ type: 'text', content: text.slice(lastIndex) });
    }
    return segments;
  }

  // ── Cas 2 : détection automatique ──────────────────────────────────────────
  // On cherche des blocs contenant ^ ou f(x)=... sans accents
  // Pattern : séquence ASCII qui contient au moins un ^ ou une fraction
  const mathPattern = /[a-zA-Z0-9()'_^{}\\/*=+\-[\].,]+(?:\^(?:\([^)àâäéèêëîïôöùûüç]+\)|[^(\s,;!?àâäéèêëîïôöùûüç]+)|_(?:\([^)]+\)|[^(\s,;!?]+))[a-zA-Z0-9()'_^{}\\/*=+\-[\].,]*/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathPattern.exec(text)) !== null) {
    const expr = match[0];

    // Vérification : doit vraiment ressembler à du math
    if (!isMathExpression(expr)) continue;

    // Texte avant l'expression
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      appendText(segments, before);
    }

    segments.push({ type: 'inline', content: toLatex(expr) });
    lastIndex = match.index + expr.length;
  }

  // Texte restant
  if (lastIndex < text.length) {
    appendText(segments, text.slice(lastIndex));
  }

  // Aucun math trouvé
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }

  return segments;
}

function appendText(
  segments: Array<{ type: 'text' | 'block' | 'inline'; content: string }>,
  value: string
) {
  if (!value) return;
  const last = segments[segments.length - 1];
  if (last && last.type === 'text') {
    last.content += value;
  } else {
    segments.push({ type: 'text', content: value });
  }
}

/**
 * MathText — affiche du texte mixte (français + math)
 *
 * Exemples :
 *   <MathText text="La dérivée de f(x) = x^3 est 3x^2" />
 *   <MathText text="Avec $f'(x) = 2x$, calculer..." />
 *   <MathText text="$$\int_0^1 x\,dx = \frac{1}{2}$$" />
 */
export function MathText({ text, className }: MathTextProps) {
  if (!text) return null;

  const segments = parseSegments(text);

  if (segments.every(s => s.type === 'text')) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, i) => {
        if (segment.type === 'block') {
          return (
            <span key={i} className="block my-2">
              <BlockMath
                math={segment.content}
                renderError={() => (
                  <span className="font-mono text-xs bg-muted px-1 rounded">
                    {segment.content}
                  </span>
                )}
              />
            </span>
          );
        }

        if (segment.type === 'inline') {
          return (
            <InlineMath
              key={i}
              math={segment.content}
              renderError={() => (
                <span className="font-mono text-xs bg-muted px-1 rounded">
                  {segment.content}
                </span>
              )}
            />
          );
        }

        return (
          <span key={i}>
            {segment.content.split('\n').map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}