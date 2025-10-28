"use client";
import React from 'react';

export interface MCQItem {
  id: number;
  question: string;
  options: string[]; // length 4
  correctAnswer: number; // 0..3
  explanation: string | null;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
}

interface Props {
  item: MCQItem;
  index: number; // display index
  selectedIndex: number | null;
  onChange: (choice: number) => void;
  showAnswer?: boolean;
}

export default function MCQQuestion({ item, index, selectedIndex, onChange, showAnswer }: Props) {
  return (
    <div className="border rounded-md p-4 mb-4 bg-white/60">
      <div className="font-medium mb-2">{index + 1}. {item.question}</div>
      <div className="space-y-2">
        {item.options.map((opt, i) => {
          const isCorrect = showAnswer && i === item.correctAnswer;
          const isSelected = selectedIndex === i;
          return (
            <label key={i} className={`flex items-center gap-2 p-2 rounded border ${
              isCorrect ? 'border-green-500 bg-green-50' : isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name={`q-${item.id}`}
                value={i}
                checked={isSelected}
                onChange={() => onChange(i)}
              />
              <span>{String.fromCharCode(65 + i)}. {opt}</span>
            </label>
          );
        })}
      </div>
      {showAnswer && (
        <div className="mt-3 text-sm">
          <div className="font-semibold text-green-700">Answer: {String.fromCharCode(65 + item.correctAnswer)}</div>
          {item.explanation && (
            <div className="text-gray-700 mt-1">Explanation: {item.explanation}</div>
          )}
        </div>
      )}
    </div>
  );
}

