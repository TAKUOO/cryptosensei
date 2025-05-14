import React from 'react';
import { History, ChevronLeft } from 'lucide-react';
import { ExplanationData } from '../types';

interface HistoryPageProps {
  history: ExplanationData[];
  onBack: () => void;
  onSelect: (data: ExplanationData) => void;
}

export function HistoryPage({ history = [], onBack, onSelect }: HistoryPageProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-text">履歴</h1>
            </div>
            <button onClick={onBack} className="btn btn-outline">
              <ChevronLeft className="h-4 w-4" />
              戻る
            </button>
          </div>

          <div className="p-6">
            {!history || history.length === 0 ? (
              <p className="text-center text-gray py-8">履歴がありません</p>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(item)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    {item.ogp?.image && (
                      <img
                        src={item.ogp.image}
                        alt={item.title || ''}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-2">
                      {item.title || item.ogp?.title || '無題'}
                    </h3>
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-mono text-sm truncate flex-1">{item.url}</p>
                      <p className="text-xs text-gray whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <p className="text-sm text-gray truncate mt-2">{item.summary}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}