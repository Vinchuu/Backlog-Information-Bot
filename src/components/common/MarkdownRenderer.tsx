import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderFormattedContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeader: string[] = [];

    const flushTable = (keyPrefix: number) => {
      if (inTable && (tableHeader.length > 0 || tableRows.length > 0)) {
        elements.push(
          <div key={`table-${keyPrefix}`} className="my-3.5 overflow-x-auto rounded-xl border border-indigo-100 bg-white shadow-sm">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-purple-50/80 text-purple-950 font-semibold border-b border-purple-100 uppercase tracking-wider text-[11px]">
                <tr>
                  {tableHeader.map((th, i) => (
                    <th key={`th-${i}`} className="px-3.5 py-2.5">
                      {renderInlineFormatting(th.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 font-normal">
                {tableRows.map((row, rIdx) => (
                  <tr key={`tr-${rIdx}`} className="hover:bg-purple-50/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={`td-${cIdx}`} className="px-3.5 py-2 text-slate-700">
                        {renderInlineFormatting(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableRows = [];
        tableHeader = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        if (cells.every((c) => /^:?-+:?$/.test(c))) {
          return;
        }

        if (!inTable) {
          inTable = true;
          tableHeader = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        flushTable(index);
      }

      // Headers
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={index} className="text-sm font-bold text-indigo-900 mt-3.5 mb-1.5 tracking-wide flex items-center gap-1.5">
            {renderInlineFormatting(trimmed.substring(5))}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-base font-bold text-slate-900 mt-4 mb-2 tracking-tight flex items-center gap-2">
            {renderInlineFormatting(trimmed.substring(4))}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-lg font-extrabold text-slate-900 mt-5 mb-2.5 border-b border-indigo-100 pb-1.5">
            {renderInlineFormatting(trimmed.substring(3))}
          </h2>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const text = trimmed.substring(2);
        elements.push(
          <li key={index} className="ml-5 list-disc text-slate-700 text-sm py-0.5 leading-relaxed marker:text-violet-500">
            {renderInlineFormatting(text)}
          </li>
        );
        return;
      }

      // Numbered lists
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        elements.push(
          <div key={index} className="flex items-start gap-2 text-sm text-slate-700 py-0.5 leading-relaxed">
            <span className="font-mono text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 rounded-md px-1.5 py-0.5 min-w-[20px] text-center mt-0.5">
              {numberedMatch[1]}
            </span>
            <span>{renderInlineFormatting(numberedMatch[2])}</span>
          </div>
        );
        return;
      }

      // Empty line
      if (!trimmed) {
        elements.push(<div key={index} className="h-1.5" />);
        return;
      }

      // Standard paragraph
      elements.push(
        <p key={index} className="text-sm text-slate-700 leading-relaxed mb-2">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Status tags
    if (text.includes('[STATUS: CLEARED]')) {
      const parts = text.split('[STATUS: CLEARED]');
      return (
        <>
          {renderInlineFormatting(parts[0])}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ CLEARED
          </span>
          {renderInlineFormatting(parts[1])}
        </>
      );
    }

    if (text.includes('[STATUS: ATKT ELIGIBLE]')) {
      const parts = text.split('[STATUS: ATKT ELIGIBLE]');
      return (
        <>
          {renderInlineFormatting(parts[0])}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
            ⚖ ATKT ELIGIBLE
          </span>
          {renderInlineFormatting(parts[1])}
        </>
      );
    }

    if (text.includes('[STATUS: YEAR DOWN RISK / CRITICAL]')) {
      const parts = text.split('[STATUS: YEAR DOWN RISK / CRITICAL]');
      return (
        <>
          {renderInlineFormatting(parts[0])}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            ⚠ CRITICAL: YEAR DOWN RISK
          </span>
          {renderInlineFormatting(parts[1])}
        </>
      );
    }

    if (text.includes('[STATUS: ACTION REQUIRED]')) {
      const parts = text.split('[STATUS: ACTION REQUIRED]');
      return (
        <>
          {renderInlineFormatting(parts[0])}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ⚡ ACTION REQUIRED
          </span>
          {renderInlineFormatting(parts[1])}
        </>
      );
    }

    // Bold & code formatting
    const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-xs border border-purple-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className={`markdown-body space-y-1 ${className}`}>{renderFormattedContent()}</div>;
};
