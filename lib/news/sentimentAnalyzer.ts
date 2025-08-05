// Rule-based sentiment analysis for financial news articles

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SentimentResult {
  sentiment: Sentiment;
  confidence: number;
  score: number;
  keywords: string[];
}

// Sentiment keywords with different intensity levels
const SENTIMENT_KEYWORDS: Record<string, Record<string, string[]>> = {
  positive: {
    strong: [
      'surge', 'soar', 'jump', 'rally', 'boom', 'bullish', 'outperform', 'upgrade', 'record', 'high',
      'exceptional', 'outstanding', 'excellent', 'strong', 'robust', 'solid', 'impressive', 'remarkable',
      'breakthrough', 'innovation', 'growth', 'expansion', 'success', 'triumph', 'victory', 'achievement',
      'profit', 'profitable', 'gain', 'boost', 'increase', 'rise', 'climb', 'advance', 'momentum'
    ],
    moderate: [
      'rise', 'gain', 'increase', 'grow', 'improve', 'positive', 'optimistic', 'boost', 'upbeat',
      'encouraging', 'promising', 'favorable', 'good', 'better', 'progress', 'recovery', 'stability',
      'steady', 'stable', 'modest', 'slight gain', 'gradual', 'incremental', 'satisfactory', 'decent'
    ],
    weak: [
      'steady', 'stable', 'modest', 'slight gain', 'gradual', 'slow', 'moderate', 'acceptable',
      'sufficient', 'adequate', 'reasonable', 'fair', 'neutral', 'balanced', 'mixed', 'varied'
    ]
  },
  negative: {
    strong: [
      'crash', 'plunge', 'slump', 'tumble', 'bearish', 'downgrade', 'crisis', 'recession', 'collapse',
      'devastating', 'catastrophic', 'disastrous', 'severe', 'critical', 'urgent', 'alarming', 'worrisome',
      'bankruptcy', 'failure', 'loss', 'lose', 'disaster', 'turmoil', 'chaos', 'panic', 'crash', 'meltdown'
    ],
    moderate: [
      'fall', 'drop', 'decline', 'decrease', 'loss', 'negative', 'pessimistic', 'cut', 'reduce',
      'concern', 'worry', 'risk', 'threat', 'challenge', 'difficulty', 'struggle', 'pressure', 'stress',
      'declining', 'falling', 'decreasing', 'weakening', 'slowing', 'deteriorating', 'worsening'
    ],
    weak: [
      'slip', 'dip', 'modest loss', 'pressure', 'concern', 'caution', 'uncertainty', 'volatility',
      'fluctuation', 'instability', 'hesitation', 'pause', 'slowdown', 'moderation', 'correction'
    ]
  }
};

// Financial context boosters - words that indicate financial impact
const FINANCIAL_CONTEXT_BOOSTERS = [
  'earnings', 'revenue', 'profit', 'loss', 'margin', 'outlook', 'forecast', 'guidance',
  'quarterly', 'annual', 'fiscal', 'financial', 'economic', 'market', 'stock', 'share',
  'dividend', 'yield', 'valuation', 'multiple', 'estimate', 'analyst', 'rating', 'target'
];

// Negation words that reverse sentiment
const NEGATION_WORDS = [
  'not', 'no', 'never', 'none', 'neither', 'nor', 'nothing', 'nowhere', 'hardly',
  'scarcely', 'barely', 'rarely', 'seldom', 'despite', 'although', 'however'
];

// Intensity modifiers
const INTENSITY_MODIFIERS = {
  amplifiers: [
    'very', 'extremely', 'highly', 'significantly', 'substantially', 'considerably',
    'remarkably', 'exceptionally', 'particularly', 'especially', 'really', 'truly'
  ],
  diminishers: [
    'slightly', 'somewhat', 'moderately', 'partially', 'minimally', 'marginally',
    'relatively', 'comparatively', 'somewhat', 'barely', 'hardly'
  ]
};

/**
 * Analyze sentiment of text
 */
export function analyzeSentiment(text: string): SentimentResult {
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  
  let positiveScore = 0;
  let negativeScore = 0;
  const positiveKeywords: string[] = [];
  const negativeKeywords: string[] = [];
  
  // Check each word for sentiment
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const nextWord = i < words.length - 1 ? words[i + 1] : '';
    
    // Check for negation
    const isNegated = isNegatedContext(words, i);
    
    // Check intensity modifiers
    const intensityMultiplier = getIntensityMultiplier(prevWord);
    
    // Check positive sentiment
    const positiveMatch = findSentimentMatch(word, SENTIMENT_KEYWORDS.positive);
    if (positiveMatch) {
      const score = getSentimentScore(positiveMatch.intensity, intensityMultiplier);
      if (isNegated) {
        negativeScore += score * 0.5; // Negated positive becomes weak negative
        negativeKeywords.push(word);
      } else {
        positiveScore += score;
        positiveKeywords.push(word);
      }
    }
    
    // Check negative sentiment
    const negativeMatch = findSentimentMatch(word, SENTIMENT_KEYWORDS.negative);
    if (negativeMatch) {
      const score = getSentimentScore(negativeMatch.intensity, intensityMultiplier);
      if (isNegated) {
        positiveScore += score * 0.5; // Negated negative becomes weak positive
        positiveKeywords.push(word);
      } else {
        negativeScore += score;
        negativeKeywords.push(word);
      }
    }
  }
  
  // Apply financial context booster
  const financialContextScore = getFinancialContextScore(cleanText);
  positiveScore *= (1 + financialContextScore * 0.2);
  negativeScore *= (1 + financialContextScore * 0.2);
  
  // Calculate final sentiment
  const totalScore = positiveScore - negativeScore;
  const maxPossibleScore = Math.max(positiveScore, negativeScore);
  const confidence = maxPossibleScore > 0 ? Math.min(maxPossibleScore / 3, 1) : 0;
  
  let sentiment: Sentiment;
  if (totalScore > 0.5) {
    sentiment = 'positive';
  } else if (totalScore < -0.5) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  // Adjust confidence based on keyword presence
  const allKeywords = [...positiveKeywords, ...negativeKeywords];
  const keywordConfidence = Math.min(allKeywords.length / 5, 1);
  const finalConfidence = (confidence + keywordConfidence) / 2;
  
  return {
    sentiment,
    confidence: finalConfidence,
    score: totalScore,
    keywords: allKeywords
  };
}

/**
 * Check if word is in a negated context
 */
function isNegatedContext(words: string[], index: number): boolean {
  const windowSize = 3; // Check 3 words before
  const start = Math.max(0, index - windowSize);
  
  for (let i = start; i < index; i++) {
    if (NEGATION_WORDS.includes(words[i])) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get intensity multiplier from modifier words
 */
function getIntensityMultiplier(prevWord: string): number {
  if (INTENSITY_MODIFIERS.amplifiers.includes(prevWord)) {
    return 1.5;
  }
  if (INTENSITY_MODIFIERS.diminishers.includes(prevWord)) {
    return 0.7;
  }
  return 1.0;
}

/**
 * Find sentiment match for a word
 */
function findSentimentMatch(word: string, sentimentDict: Record<string, string[]>): { intensity: string } | null {
  for (const [intensity, keywords] of Object.entries(sentimentDict)) {
    if (keywords.includes(word)) {
      return { intensity };
    }
  }
  
  // Check for partial matches (e.g., 'growing' contains 'grow')
  for (const [intensity, keywords] of Object.entries(sentimentDict)) {
    for (const keyword of keywords) {
      if (word.includes(keyword) || keyword.includes(word)) {
        return { intensity };
      }
    }
  }
  
  return null;
}

/**
 * Get sentiment score based on intensity and multiplier
 */
function getSentimentScore(intensity: string, multiplier: number): number {
  const baseScores = {
    strong: 3,
    moderate: 2,
    weak: 1
  };
  
  return baseScores[intensity as keyof typeof baseScores] * multiplier;
}

/**
 * Get financial context score
 */
function getFinancialContextScore(text: string): number {
  let matches = 0;
  for (const booster of FINANCIAL_CONTEXT_BOOSTERS) {
    if (text.includes(booster)) {
      matches++;
    }
  }
  return Math.min(matches / 5, 1); // Normalize to 0-1
}

/**
 * Analyze sentiment for news article (title + summary)
 */
export function analyzeArticleSentiment(title: string, summary: string): SentimentResult {
  const combinedText = `${title} ${summary}`;
  return analyzeSentiment(combinedText);
}

/**
 * Batch analyze sentiment for multiple articles
 */
export function batchAnalyzeSentiment(articles: Array<{ title: string; summary: string }>): SentimentResult[] {
  return articles.map(article => analyzeArticleSentiment(article.title, article.summary));
}

/**
 * Get sentiment distribution for a batch of articles
 */
export function getSentimentDistribution(sentiments: SentimentResult[]): {
  positive: number;
  negative: number;
  neutral: number;
} {
  const total = sentiments.length;
  if (total === 0) {
    return { positive: 0, negative: 0, neutral: 0 };
  }
  
  const positive = sentiments.filter(s => s.sentiment === 'positive').length;
  const negative = sentiments.filter(s => s.sentiment === 'negative').length;
  const neutral = sentiments.filter(s => s.sentiment === 'neutral').length;
  
  return {
    positive: positive / total,
    negative: negative / total,
    neutral: neutral / total
  };
}
