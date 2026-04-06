"""
AI Service for Customer Support Ticket System
Provides intelligent ticket processing, classification, and auto-responses
"""
import re
from collections import Counter
from typing import Dict, List, Tuple, Optional
import random


class TextAnalyzer:
    """Simple text analysis without external dependencies"""
    
    # Common category keywords
    CATEGORY_KEYWORDS = {
        'technical': [
            'error', 'bug', 'crash', 'not working', 'broken', 'fix', 'issue',
            'exception', 'stack trace', 'debug', 'code', 'api', 'server',
            'database', 'connection', 'timeout', 'performance', 'slow'
        ],
        'billing': [
            'invoice', 'payment', 'charge', 'refund', 'subscription', 'pricing',
            'cost', 'bill', 'credit', 'debit', 'transaction', 'subscription',
            'plan', 'upgrade', 'downgrade', 'cancel billing'
        ],
        'account': [
            'password', 'login', 'account', 'access', 'permission', 'username',
            'email', 'profile', 'settings', 'authentication', 'register',
            'signup', 'signin', 'locked', 'reset password'
        ],
        'feature_request': [
            'feature', 'request', 'suggestion', 'would be nice', 'could you add',
            'enhancement', 'improve', 'missing', 'need', 'want', 'prefer'
        ],
        'general_inquiry': [
            'question', 'how to', 'help', 'information', 'know', 'wondering',
            'tell me', 'explain', 'what is', 'where is', 'when'
        ]
    }
    
    # Priority indicators
    PRIORITY_KEYWORDS = {
        'urgent': [
            'urgent', 'emergency', 'critical', 'immediately', 'asap', 'down',
            'outage', 'not working at all', 'completely broken', 'production'
        ],
        'high': [
            'important', 'priority', 'soon', 'blocking', 'cannot work',
            'significant', 'major issue', 'affecting many'
        ],
        'medium': [
            'when possible', 'not urgent', 'low priority', 'minor',
            'inconvenient', 'would like'
        ],
        'low': [
            'when you get chance', 'no rush', 'eventually', 'nice to have',
            'small issue', 'cosmetic'
        ]
    }
    
    # Sentiment word lists
    POSITIVE_WORDS = [
        'thank', 'thanks', 'great', 'excellent', 'amazing', 'love', 'appreciate',
        'wonderful', 'fantastic', 'helpful', 'best', 'perfect', 'good', 'happy',
        'satisfied', 'pleased', 'awesome', 'nice', 'glad', 'impressed'
    ]
    
    NEGATIVE_WORDS = [
        'terrible', 'awful', 'horrible', 'hate', 'angry', 'frustrated', 'disappointed',
        'worst', 'useless', 'annoying', 'pathetic', 'unacceptable', 'ridiculous',
        'outrageous', 'furious', 'upset', 'mad', 'irritated', 'fed up', 'broken'
    ]
    
    @classmethod
    def classify_category(cls, text: str) -> Tuple[str, float]:
        """Classify ticket into a category based on keywords"""
        text_lower = text.lower()
        scores = {}
        
        for category, keywords in cls.CATEGORY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                scores[category] = score
        
        if not scores:
            return 'general_inquiry', 0.5
        
        # Get the category with highest score
        best_category = max(scores, key=scores.get)
        confidence = min(scores[best_category] / 3.0, 1.0)
        
        return best_category, confidence
    
    @classmethod
    def detect_priority(cls, text: str) -> Tuple[str, int]:
        """Detect priority level from text"""
        text_lower = text.lower()
        priority_scores = {'urgent': 0, 'high': 0, 'medium': 0, 'low': 0}
        
        for priority, keywords in cls.PRIORITY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if priority == 'urgent':
                        priority_scores[priority] += 3
                    elif priority == 'high':
                        priority_scores[priority] += 2
                    else:
                        priority_scores[priority] += 1
        
        # Return highest priority if tie
        max_score = max(priority_scores.values())
        if max_score == 0:
            return 'medium', 5
        
        # Priority order: urgent > high > medium > low
        if priority_scores['urgent'] == max_score:
            return 'urgent', 1
        elif priority_scores['high'] == max_score:
            return 'high', 2
        elif priority_scores['medium'] == max_score:
            return 'medium', 5
        else:
            return 'low', 10
    
    @classmethod
    def analyze_sentiment(cls, text: str) -> Tuple[str, float]:
        """Analyze sentiment of the text"""
        text_lower = text.lower()
        words = set(re.findall(r'\b\w+\b', text_lower))
        
        positive_count = sum(1 for word in cls.POSITIVE_WORDS if word in words)
        negative_count = sum(1 for word in cls.NEGATIVE_WORDS if word in words)
        
        total = positive_count + negative_count
        if total == 0:
            return 'neutral', 0.5
        
        positive_ratio = positive_count / total
        
        if positive_ratio > 0.6:
            return 'positive', positive_ratio
        elif positive_ratio < 0.4:
            return 'negative', 1 - positive_ratio
        else:
            return 'neutral', 0.5
    
    @classmethod
    def extract_entities(cls, text: str) -> Dict[str, List[str]]:
        """Extract key entities from text"""
        entities = {
            'emails': re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text),
            'urls': re.findall(r'https?://[^\s]+', text),
            'phone_numbers': re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text),
            'order_ids': re.findall(r'(?:order|order_id|orderid)[:\s]*([A-Z0-9]+)', text, re.I),
            'ticket_ids': re.findall(r'(?:#|ticket)[:\s]*(\d+)', text, re.I)
        }
        return {k: v for k, v in entities.items() if v}
    
    @classmethod
    def summarize(cls, text: str, max_sentences: int = 2) -> str:
        """Simple extractive summarization"""
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        if len(sentences) <= max_sentences:
            return text
        
        # Simple scoring based on word frequency
        words = re.findall(r'\b\w+\b', text.lower())
        word_freq = Counter(words)
        
        scored_sentences = []
        for sentence in sentences:
            sentence_words = re.findall(r'\b\w+\b', sentence.lower())
            score = sum(word_freq.get(w, 0) for w in sentence_words)
            scored_sentences.append((score, sentence))
        
        scored_sentences.sort(reverse=True)
        top_sentences = [s[1] for s in scored_sentences[:max_sentences]]
        
        return '. '.join(top_sentences) + '.'


class AutoResponseGenerator:
    """Generate auto-response suggestions for tickets"""
    
    TEMPLATES = {
        'technical': {
            'greeting': "Thank you for contacting our technical support team.",
            'received': "We've received your technical issue report and our team is reviewing it.",
            'investigating': "Our technical team is investigating the issue you reported.",
            'resolved': "We're pleased to inform you that the technical issue has been resolved.",
            'follow_up': "Please provide any additional details about when the issue occurs, including any error messages.",
        },
        'billing': {
            'greeting': "Thank you for reaching out regarding your billing inquiry.",
            'received': "We've received your billing concern and our accounts team is reviewing it.",
            'investigating': "Our billing department is looking into your account to resolve this matter.",
            'resolved': "Your billing concern has been addressed. Please check your account for updated information.",
            'follow_up': "Could you please provide your account email and the specific invoice number in question?",
        },
        'account': {
            'greeting': "Thank you for contacting us about your account.",
            'received': "We've received your account-related request and our team is looking into it.",
            'investigating': "Our account management team is reviewing your request.",
            'resolved': "Your account issue has been resolved. Please try logging in again.",
            'follow_up': "For security purposes, please confirm the email address associated with your account.",
        },
        'feature_request': {
            'greeting': "Thank you for your feature suggestion!",
            'received': "We've received your feature request and shared it with our product team.",
            'investigating': "Our product team is evaluating your suggestion for future updates.",
            'resolved': "We're excited to inform you that your suggested feature is now available!",
            'follow_up': "Can you tell us more about how this feature would help your workflow?",
        },
        'general_inquiry': {
            'greeting': "Thank you for contacting our support team.",
            'received': "We've received your inquiry and will get back to you shortly.",
            'investigating': "Our team is looking into your question.",
            'resolved': "We hope this information helps! Let us know if you need anything else.",
            'follow_up': "Please let us know if you have any other questions we can help with.",
        }
    }
    
    @classmethod
    def generate_response(cls, category: str, sentiment: str, ticket_title: str) -> Dict[str, str]:
        """Generate a contextual auto-response"""
        templates = cls.TEMPLATES.get(category, cls.TEMPLATES['general_inquiry'])
        
        # Adjust based on sentiment
        if sentiment == 'negative':
            empathy = "We understand your frustration and want to help resolve this as quickly as possible."
        elif sentiment == 'positive':
            empathy = "We're happy to assist you!"
        else:
            empathy = "We're here to help!"
        
        response = {
            'greeting': templates['greeting'],
            'empathy': empathy,
            'received': templates['received'],
            'follow_up': templates['follow_up'],
            'closing': "Thank you for your patience. We'll update you soon.\n\nBest regards,\nSupport Team"
        }
        
        return response
    
    @classmethod
    def generate_full_response(cls, category: str, sentiment: str, ticket_title: str) -> str:
        """Generate a complete auto-response message"""
        parts = cls.generate_response(category, sentiment, ticket_title)
        return f"{parts['greeting']}\n\n{parts['empathy']}\n\n{parts['received']}\n\n{parts['follow_up']}\n\n{parts['closing']}"


class TicketAIProcessor:
    """Main AI processor for tickets"""
    
    def __init__(self):
        self.analyzer = TextAnalyzer()
        self.response_generator = AutoResponseGenerator()
    
    def process_ticket(self, title: str, description: str) -> Dict:
        """Process a ticket and return AI analysis"""
        combined_text = f"{title} {description}"
        
        # Run all analyses
        category, category_confidence = self.analyzer.classify_category(combined_text)
        priority, priority_score = self.analyzer.detect_priority(combined_text)
        sentiment, sentiment_score = self.analyzer.analyze_sentiment(combined_text)
        entities = self.analyzer.extract_entities(combined_text)
        summary = self.analyzer.summarize(combined_text)
        
        # Generate suggested response
        suggested_response = self.response_generator.generate_full_response(
            category, sentiment, title
        )
        
        return {
            'category': category,
            'category_confidence': round(category_confidence, 2),
            'priority': priority,
            'priority_score': priority_score,
            'sentiment': sentiment,
            'sentiment_score': round(sentiment_score, 2),
            'entities': entities,
            'summary': summary,
            'suggested_response': suggested_response,
            'processing_timestamp': None  # Will be set by the caller
        }
    
    def suggest_assignee(self, ticket_data: Dict, available_agents: List[Dict]) -> Optional[Dict]:
        """Suggest the best agent to assign based on ticket characteristics"""
        if not available_agents:
            return None
        
        category = ticket_data.get('category', 'general_inquiry')
        priority = ticket_data.get('priority', 'medium')
        
        # Score each agent based on their specialization and workload
        agent_scores = []
        for agent in available_agents:
            score = 0
            
            # Bonus for matching specialization
            if agent.get('specialization') == category:
                score += 10
            
            # Lower workload = higher score
            current_tickets = agent.get('current_tickets', 0)
            score += max(0, 5 - current_tickets)
            
            # Priority handling for senior agents
            if priority == 'urgent' and agent.get('is_senior'):
                score += 5
            
            agent_scores.append((score, agent))
        
        # Return the best match
        agent_scores.sort(reverse=True)
        return agent_scores[0][1] if agent_scores else None
    
    def detect_duplicates(self, new_ticket: Dict, existing_tickets: List[Dict], threshold: float = 0.7) -> List[Dict]:
        """Detect potential duplicate tickets"""
        duplicates = []
        new_text = f"{new_ticket.get('title', '')} {new_ticket.get('description', '')}".lower()
        new_words = set(re.findall(r'\b\w+\b', new_text))
        
        for ticket in existing_tickets:
            existing_text = f"{ticket.get('title', '')} {ticket.get('description', '')}".lower()
            existing_words = set(re.findall(r'\b\w+\b', existing_text))
            
            # Jaccard similarity
            intersection = len(new_words & existing_words)
            union = len(new_words | existing_words)
            similarity = intersection / union if union > 0 else 0
            
            if similarity >= threshold:
                duplicates.append({
                    'ticket_id': ticket.get('id'),
                    'title': ticket.get('title'),
                    'status': ticket.get('status'),
                    'similarity': round(similarity, 2)
                })
        
        return duplicates
