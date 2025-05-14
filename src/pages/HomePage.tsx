import React, { useState, useEffect } from 'react';
import { NewspaperIcon, ArrowRightIcon, History } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ExplanationData } from '../types';
import { saveExplanation, getExplanationHistory } from '../lib/supabase';
import { HistoryPage } from './HistoryPage';
import { ExplanationPage } from './ExplanationPage';

export function HomePage() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ExplanationData[]>([]);
  const [currentArticle, setCurrentArticle] = useState<ExplanationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyData = await getExplanationHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      setError('履歴の読み込みに失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const explanation = await saveExplanation(url);
      setCurrentArticle(explanation);
      await loadHistory();
      setShowDemo(true);
    } catch (error) {
      console.error('Error generating explanation:', error);
      setError('記事の解説生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (showHistory) {
    return <HistoryPage history={history} onBack={() => setShowHistory(false)} onSelect={(data) => {
      setCurrentArticle(data);
      setShowDemo(true);
      setShowHistory(false);
    }} />;
  }

  if (showDemo && currentArticle) {
    return <ExplanationPage article={currentArticle} onBack={() => setShowDemo(false)} />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {user ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <NewspaperIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-text">
                仮想通貨ニュースをわかりやすく解説
              </h1>
            </div>

            <div className="card p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium mb-2 text-gray">
                    ニュースのURLを入力してください
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input"
                    placeholder="https://example.com/crypto-news"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <span>解析中...</span>
                  ) : (
                    <>
                      <span>解説する</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </form>

              <div className="mt-6 pt-6 border-t border-border flex justify-between">
                <button
                  onClick={() => setShowHistory(true)}
                  className="btn btn-outline"
                >
                  <History className="h-4 w-4" />
                  履歴を見る
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray mb-4">ログインして記事の解説を始めましょう</p>
            <button onClick={() => supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: window.location.origin
              }
            })} className="btn btn-primary">
              Googleでログイン
            </button>
          </div>
        )}
      </div>
    </div>
  );
}