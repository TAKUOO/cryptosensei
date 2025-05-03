import React, { useState, useEffect } from 'react';
import { NewspaperIcon, ArrowRightIcon, Sparkles, Star, BookOpen, History, ChevronLeft, Share2, Link, Volume2, Square } from 'lucide-react';

interface ExplanationData {
  url: string;
  timestamp: number;
  summary: string;
  importantPoints: {
    importance: number;
    content: string;
    explanation: string;
    analogy: string;
  }[];
  skipSections: {
    number: number;
    reason: string;
  }[];
}

function SpeechButton({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleEnd = () => setIsPlaying(false);
    speechSynthesis.addEventListener('end', handleEnd);
    return () => {
      speechSynthesis.removeEventListener('end', handleEnd);
      speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      onClick={handleSpeak}
      className="btn btn-outline"
    >
      {isPlaying ? (
        <Square className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span>{isPlaying ? '停止' : '音声で聞く'}</span>
    </button>
  );
}

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ExplanationData[]>([]);
  const [currentArticle, setCurrentArticle] = useState<ExplanationData | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('cryptoExplanationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (data: ExplanationData) => {
    const newHistory = [data, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('cryptoExplanationHistory', JSON.stringify(newHistory));
    setCurrentArticle(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const demoData: ExplanationData = {
        url,
        timestamp: Date.now(),
        summary: "ビットコインの価格が史上最高値を更新し、機関投資家の参入が加速しています。",
        importantPoints: [
          {
            importance: 3,
            content: "ビットコインETFの承認により、機関投資家の参入障壁が低下",
            explanation: "これまで難しかった機関投資家の仮想通貨投資が、ETFを通じて簡単になりました",
            analogy: "株式投資信託を買うような感覚で、ビットコインに投資できるようになったんです！"
          },
          {
            importance: 2,
            content: "大手企業による仮想通貨決済の採用拡大",
            explanation: "実際の商取引での仮想通貨の利用が増えています",
            analogy: "電子マネーが使えるお店が増えていくようなイメージです"
          }
        ],
        skipSections: [
          {
            number: 3,
            reason: "技術的な詳細の説明で、概要を理解する上では重要度が低いです"
          }
        ]
      };
      saveToHistory(demoData);
      setIsLoading(false);
      setShowDemo(true);
    }, 1500);
  };

  if (showHistory) {
    return <HistoryPage history={history} onBack={() => setShowHistory(false)} onSelect={(data) => {
      setCurrentArticle(data);
      setShowDemo(true);
      setShowHistory(false);
    }} />;
  }

  if (showDemo) {
    return <ExplanationPage article={currentArticle} onBack={() => setShowDemo(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
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
            </form>

            <div className="mt-6 pt-6 border-t border-border flex justify-between">
              <button
                onClick={() => setShowDemo(true)}
                className="btn btn-outline"
              >
                <Sparkles className="h-4 w-4" />
                サンプルを見る
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="btn btn-outline"
              >
                <History className="h-4 w-4" />
                履歴を見る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryPage({ history, onBack, onSelect }: { 
  history: ExplanationData[], 
  onBack: () => void,
  onSelect: (data: ExplanationData) => void 
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-text">履歴</h1>
              </div>
              <button
                onClick={onBack}
                className="btn btn-outline"
              >
                <ChevronLeft className="h-4 w-4" />
                戻る
              </button>
            </div>

            <div className="p-6">
              {history.length === 0 ? (
                <p className="text-center text-gray py-8">履歴がありません</p>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => onSelect(item)}
                      className="w-full text-left p-4 rounded-lg border border-border hover:border-primary transition-colors"
                    >
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
    </div>
  );
}

function ExplanationPage({ article, onBack }: { article: ExplanationData | null, onBack: () => void }) {
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cryptoかんたん解説',
          text: article?.summary || '',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const demoArticle = article || {
    url: "https://example.com/crypto-news",
    timestamp: Date.now(),
    summary: "ビットコインの価格が史上最高値を更新し、機関投資家の参入が加速しています。",
    importantPoints: [
      {
        importance: 3,
        content: "ビットコインETFの承認により、機関投資家の参入障壁が低下",
        explanation: "これまで難しかった機関投資家の仮想通貨投資が、ETFを通じて簡単になりました",
        analogy: "株式投資信託を買うような感覚で、ビットコインに投資できるようになったんです！"
      },
      {
        importance: 2,
        content: "大手企業による仮想通貨決済の採用拡大",
        explanation: "実際の商取引での仮想通貨の利用が増えています",
        analogy: "電子マネーが使えるお店が増えていくようなイメージです"
      }
    ],
    skipSections: [
      {
        number: 3,
        reason: "技術的な詳細の説明で、概要を理解する上では重要度が低いです"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-text">AIによる解説</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="btn btn-outline"
                >
                  <Share2 className="h-4 w-4" />
                  共有
                </button>
                <button
                  onClick={onBack}
                  className="btn btn-outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  戻る
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-gray" />
                <a
                  href={demoArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono text-sm"
                >
                  {demoArticle.url}
                </a>
              </div>

              <section className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    ざっくり要約
                  </h2>
                  <SpeechButton text={demoArticle.summary} />
                </div>
                <p className="text-gray-700">
                  {demoArticle.summary}
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  重要ポイント
                </h2>
                {demoArticle.importantPoints.map((point, index) => (
                  <div key={index} className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(point.importance)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-primary fill-current" />
                        ))}
                      </div>
                      <SpeechButton text={`${point.content}。${point.explanation}。${point.analogy}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{point.content}</h3>
                    <p className="text-gray mb-4">{point.explanation}</p>
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-sm">
                        <span className="font-semibold">わかりやすく言うと：</span> {point.analogy}
                      </p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="card p-6">
                <h2 className="text-lg font-semibold mb-4">読み飛ばしてよい部分</h2>
                {demoArticle.skipSections.map((section, index) => (
                  <div key={index} className="flex items-start gap-3 text-gray">
                    <div className="badge">#{section.number}</div>
                    <p>{section.reason}</p>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>

      {showShareToast && (
        <div className="toast">
          URLをコピーしました
        </div>
      )}
    </div>
  );
}

export default App;