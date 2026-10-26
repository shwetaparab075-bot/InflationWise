import React from 'react';

export default function DataTable({ headers, rows, empty }) {
  if (!rows.length) {
    return <div className="card p-6 text-sm text-[#6B7280]">{empty}</div>;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#20205A] text-white">
          <tr>{headers.map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index} className="border-t border-[#E6EEF3]">
              {cells.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 text-[#1C2340]">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
