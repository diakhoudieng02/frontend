import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import type { Components } from 'react-markdown';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
interface MarkdownRendererProps {
  content: string;
  className?: string;
  onHeadingClick?: (id: string) => void;
}

export function MarkdownRenderer({ content, className, onHeadingClick }: MarkdownRendererProps) {
  // Générer un ID à partir du texte pour le scroll
  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Composants personnalisés avec le bon typage
  const components: Components = {
    // Titres avec IDs pour la navigation
    h1: ({ children }) => {
      const text = children?.toString() || '';
      const id = generateId(text);
      return (
        <h1 
          id={id}
          onClick={() => onHeadingClick?.(id)}
          className="text-2xl font-display font-bold mt-8 mb-4 scroll-mt-20 cursor-pointer hover:text-primary transition-colors"
        >
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const text = children?.toString() || '';
      const id = generateId(text);
      return (
        <h2 
          id={id}
          onClick={() => onHeadingClick?.(id)}
          className="text-xl font-display font-semibold mt-6 mb-3 scroll-mt-20 cursor-pointer hover:text-primary transition-colors"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = children?.toString() || '';
      const id = generateId(text);
      return (
        <h3 
          id={id}
          onClick={() => onHeadingClick?.(id)}
          className="text-lg font-medium mt-4 mb-2 scroll-mt-20 cursor-pointer hover:text-primary transition-colors"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const text = children?.toString() || '';
      const id = generateId(text);
      return (
        <h4 
          id={id}
          onClick={() => onHeadingClick?.(id)}
          className="text-base font-medium mt-3 mb-1 scroll-mt-20 cursor-pointer hover:text-primary transition-colors"
        >
          {children}
        </h4>
      );
    },

    // Paragraphes
    p: ({ children }) => (
      <p className="text-muted-foreground leading-relaxed mb-4">
        {children}
      </p>
    ),

    // Listes
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1 text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-muted-foreground">{children}</li>
    ),

    // Citations
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/30 rounded-r-lg text-muted-foreground italic">
        {children}
      </blockquote>
    ),

    // Code inline et blocs de code
   code: ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const isInline = !match;
  
  return !isInline ? (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={match?.[1]}
      PreTag="div"
      className="rounded-xl my-4 text-sm"
      {...props as SyntaxHighlighterProps}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
      {children}
    </code>
  );
},

    // Tableaux
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-border">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/50">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-sm">
        {children}
      </td>
    ),

    // Liens
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    ),

    // Images
    img: ({ src, alt }) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full rounded-lg my-4"
        loading="lazy"
      />
    ),

    // Séparateur
    hr: () => (
      <hr className="my-6 border-border" />
    ),
  };

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}