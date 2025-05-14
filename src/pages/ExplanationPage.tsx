import React, { useState, useEffect } from 'react';
import { Sparkles, Star, BookOpen, History, ChevronLeft, Share2, Link, Volume2, Square } from 'lucide-react';
import { ExplanationData } from '../types';

interface ExplanationPageProps {
  article: ExplanationData;
  onBack: () => void;
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

export function ExplanationPage({ article, onBack }: ExplanationPageProps) {
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title || 'Cryptoかんたん解説',
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="p-6 border-b border-border">
            {article.ogp?.image && (
              <img
                src={article.ogp.image}
                alt={article.title || ''}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-text">
                  {article.title || article.ogp?.title || 'AIによる解説'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleShare} className="btn btn-outline">
                  <Share2 className="h-4 w-4" />
                  共有
                </button>
                <button onClick={onBack} className="btn btn-outline">
                  <ChevronLeft className="h-4 w-4" />
                  戻る
                </button>
              </div>
            </div>
            {article.ogp?.siteName && (
              <p className="text-sm text-gray mt-2">{article.ogp.siteName}</p>
            )}
          </div>

          <div className="p-6 space-y-8">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-gray" />
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono text-sm"
              >
                {article.url}
              </a>
            </div>

            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  ざっくり要約
                </h2>
                <SpeechButton text={article.summary} />
              </div>
              <p className="text-gray-700">
                {article.summary}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                重要ポイント
              </h2>
              {article.importantPoints.map((point, index) => (
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
              {article.skipSections.map((section, index) => (
                <div key={index} className="flex items-start gap-3 text-gray">
                  <div className="badge">#{section.number}</div>
                  <p>{section.reason}</p>
                </div>
              ))}
            </section>
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