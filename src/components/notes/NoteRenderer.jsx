import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Recursive Note Renderer Component
 * Renders any structured JSON data dynamically based on its structure
 * Follows the generation guide approach for universal template rendering
 * Replaced MUI with Tailwind CSS + Glassmorphism
 */
const NoteRenderer = ({ data, title, level = 0 }) => {
  // Handle null or undefined data
  if (!data) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        No data available
      </p>
    );
  }

  // Handle string values
  if (typeof data === 'string') {
    return (
      <p
        className={`text-sm whitespace-pre-wrap ${data === 'Not assessed'
            ? 'text-gray-400 dark:text-gray-500 italic'
            : 'text-gray-700 dark:text-gray-200'
          }`}
      >
        {data}
      </p>
    );
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No items
        </p>
      );
    }

    // If array contains objects, render as table
    if (typeof data[0] === 'object') {
      const keys = Object.keys(data[0]);
      return (
        <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <tr>
                  {keys.map(key => (
                    <th key={key} className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {formatKey(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    {keys.map(key => (
                      <td key={key} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        <NoteRenderer data={item[key]} level={level + 1} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // If array contains strings, render as chips or list
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {data.map((item, index) => (
          <span
            key={index}
            className={`
              px-2.5 py-1 rounded-full text-xs font-medium border
              ${item === 'Not assessed'
                ? 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'
                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20'}
            `}
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  // Handle objects
  if (typeof data === 'object') {
    const entries = Object.entries(data);

    if (entries.length === 0) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No data
        </p>
      );
    }

    // Special handling for ROM and MMT data (common PT structures)
    if (isROMData(data)) {
      return renderROMTable(data);
    }

    if (isMMTData(data)) {
      return renderMMTTable(data);
    }

    // For top-level sections, use accordions
    if (level === 0) {
      return (
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <AccordionItem key={key} title={formatKey(key)}>
              <NoteRenderer data={value} level={level + 1} />
            </AccordionItem>
          ))}
        </div>
      );
    }

    // For nested objects, use simple sections
    return (
      <div className="space-y-4">
        {entries.map(([key, value]) => (
          <div key={key} className="pl-2 border-l-2 border-gray-100 dark:border-white/5">
            <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2 pl-2">
              {formatKey(key)}
            </h4>
            <div className="pl-2">
              <NoteRenderer data={value} level={level + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle other primitive types
  return (
    <p className="text-sm text-gray-700 dark:text-gray-200">
      {String(data)}
    </p>
  );
};

/**
 * Accordion Component for sections
 */
const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/60 dark:hover:bg-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-2 border-t border-gray-200/50 dark:border-white/5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to format keys for display
 */
function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Check if data represents ROM (Range of Motion) structure
 */
function isROMData(data) {
  const keys = Object.keys(data);
  return keys.some(key =>
    key.includes('flexion') ||
    key.includes('extension') ||
    key.includes('abduction') ||
    (data[key] && typeof data[key] === 'object' &&
      ('value' in data[key] || 'r_value' in data[key] || 'normal' in data[key]))
  );
}

/**
 * Check if data represents MMT (Manual Muscle Testing) structure
 */
function isMMTData(data) {
  const keys = Object.keys(data);
  return keys.some(key =>
    key.includes('flexor') ||
    key.includes('extensor') ||
    (data[key] && typeof data[key] === 'object' &&
      ('grade' in data[key] || 'r_grade' in data[key]))
  );
}

/**
 * Render ROM data as a specialized table
 */
function renderROMTable(data) {
  const movements = Object.entries(data);

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
            <tr>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Movement</th>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Right</th>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Left</th>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Normal</th>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Symptoms</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {movements.map(([movement, values]) => (
              <tr key={movement} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                  {formatKey(movement)}
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{values.r_value || values.value || 'Not assessed'}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{values.l_value || values.value || 'Not assessed'}</td>
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{values.normal || 'N/A'}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{values.r_symptoms || values.l_symptoms || values.symptoms || 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Render MMT data as a specialized table
 */
function renderMMTTable(data) {
  const muscles = Object.entries(data);

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
            <tr>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Muscle Group</th>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Right Grade</th>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Left Grade</th>
              <th className="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100">Pain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {muscles.map(([muscle, values]) => (
              <tr key={muscle} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                  {formatKey(muscle)}
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{values.r_grade || values.grade || 'Not assessed'}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{values.l_grade || values.grade || 'Not assessed'}</td>
                <td className="px-4 py-2">
                  {values.r_pain || values.l_pain || values.pain ?
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                      Pain
                    </span> :
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                      No Pain
                    </span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NoteRenderer;
