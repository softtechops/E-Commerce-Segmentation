"""
Customer Feedback & Sentiment Analytics Module
Implements an explainable, rule-and-lexicon-based NLP sentiment analyzer
with negation handling and rating cross-calibration.
Completely local, deterministic, and free of paid APIs.
"""
import re
from typing import Dict, Any, List
import pandas as pd

# Lexicons for explainable sentiment scoring
POSITIVE_WORDS = {
    'excellent', 'outstanding', 'love', 'great', 'superb', 'best', 'flawless',
    'superior', 'happy', 'worth', 'helpful', 'fast', 'good', 'satisfied',
    'reliable', 'genuine', 'recommend', 'perfect', 'top-notch', 'friendly',
    'pocket-friendly', 'affordable', 'value', 'pleased', 'prompt', 'clean',
    'efficient', 'exceptional', 'amazing', 'fabulous', 'wonderful'
}

NEGATIVE_WORDS = {
    'delayed', 'damaged', 'worst', 'poor', 'disappointed', 'terrible', 'unhelpful',
    'frustrating', 'defective', 'broken', 'rude', 'late', 'bad', 'horrible',
    'refund', 'misleading', 'unhappy', 'issue', 'complaint', 'problem', 'awful',
    'cheap', 'faulty', 'useless', 'slow', 'waste', 'regret', 'scam', 'failed'
}

NEGATION_WORDS = {
    'not', 'never', 'no', 'hardly', 'barely', 'scarcely', "wasn't", "didn't",
    "doesn't", "isn't", "cannot", "can't", "won't", "neither"
}

def analyze_sentiment(text: str, rating: int = 3) -> Dict[str, Any]:
    """
    Analyzes review text and rating using explainable rule-based NLP.
    Returns dictionary with sentiment label, polarity score, and detected keywords.
    """
    if not text or not isinstance(text, str):
        text = ""
        
    cleaned_text = text.lower()
    tokens = re.findall(r"\b[a-z'-]+\b", cleaned_text)
    
    pos_score = 0
    neg_score = 0
    matched_pos = []
    matched_neg = []
    
    for i, token in enumerate(tokens):
        # Look back up to 2 words for negation context
        has_negation = any(tokens[j] in NEGATION_WORDS for j in range(max(0, i - 2), i))
        
        if token in POSITIVE_WORDS:
            if has_negation:
                neg_score += 1.5
                matched_neg.append(f"not {token}")
            else:
                pos_score += 1.0
                matched_pos.append(token)
        elif token in NEGATIVE_WORDS:
            if has_negation:
                pos_score += 1.0
                matched_pos.append(f"not {token}")
            else:
                neg_score += 1.5
                matched_neg.append(token)

    # Base textual score
    net_score = pos_score - neg_score
    
    # Cross-reference with rating for higher accuracy
    if rating >= 4 and net_score >= 0:
        sentiment = "Positive"
    elif rating <= 2 and net_score <= 0:
        sentiment = "Negative"
    elif net_score > 0.5:
        sentiment = "Positive"
    elif net_score < -0.5:
        sentiment = "Negative"
    elif rating >= 4 and net_score > -0.5:
        sentiment = "Positive"
    elif rating <= 2 and net_score < 0.5:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
        
    return {
        "sentiment": sentiment,
        "net_score": net_score,
        "positive_keywords": matched_pos,
        "negative_keywords": matched_neg
    }

def process_feedback_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Processes all customer feedback in the DataFrame and calculates overall metrics.
    """
    sentiments = []
    scores = []
    
    for _, row in df.iterrows():
        feedback_text = str(row.get('Feedback', ''))
        rating_val = int(row.get('Rating', 3))
        res = analyze_sentiment(feedback_text, rating_val)
        sentiments.append(res['sentiment'])
        scores.append(res['net_score'])
        
    df['Sentiment'] = sentiments
    df['Sentiment_Score'] = scores
    
    total = len(df)
    pos_count = int((df['Sentiment'] == 'Positive').sum())
    neu_count = int((df['Sentiment'] == 'Neutral').sum())
    neg_count = int((df['Sentiment'] == 'Negative').sum())
    
    avg_rating = round(float(df['Rating'].mean()), 2) if total > 0 else 0.0
    
    # Rating distributions
    rating_dist = {}
    for r in range(1, 6):
        rating_dist[str(r)] = int((df['Rating'] == r).sum())
        
    summary = {
        "total_feedback": total,
        "positive_count": pos_count,
        "neutral_count": neu_count,
        "negative_count": neg_count,
        "positive_percentage": round((pos_count / total * 100), 1) if total > 0 else 0.0,
        "neutral_percentage": round((neu_count / total * 100), 1) if total > 0 else 0.0,
        "negative_percentage": round((neg_count / total * 100), 1) if total > 0 else 0.0,
        "average_rating": avg_rating,
        "rating_distribution": rating_dist
    }
    
    return summary
