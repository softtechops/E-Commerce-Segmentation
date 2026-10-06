"""
K-Modes Clustering Engine for E-Commerce Categorical Segmentation
Trains K-Modes model on categorical features, dynamically profiles clusters,
determines business recommendations, and provides real-time customer segment prediction.
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from kmodes.kmodes import KModes

from backend.services.preprocessing import CATEGORICAL_FEATURES

class CustomerClusteringModel:
    def __init__(self, n_clusters: int = 4, random_state: int = 42):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.model: Optional[KModes] = None
        self.features = CATEGORICAL_FEATURES
        self.cluster_profiles: List[Dict[str, Any]] = []
        self.cost_: Optional[float] = None
        self.is_trained: bool = False

    def train(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Trains K-Modes clustering on the preprocessed categorical customer features.
        Calculates cluster statistics, dynamic titles, and business recommendations.
        """
        # Ensure all required features are present
        X = df[self.features].values

        # Initialize and fit K-Modes with Huang initialization
        self.model = KModes(
            n_clusters=self.n_clusters,
            init='Huang',
            n_init=5,
            verbose=0,
            random_state=self.random_state
        )
        
        cluster_labels = self.model.fit_predict(X)
        self.cost_ = float(self.model.cost_)
        self.is_trained = True

        df['Cluster'] = cluster_labels
        total_customers = len(df)

        # Profile each cluster dynamically
        profiles = []
        used_titles = set()

        for c_id in range(self.n_clusters):
            c_mask = (df['Cluster'] == c_id)
            c_df = df[c_mask]
            c_count = int(len(c_df))
            c_percent = round((c_count / total_customers * 100), 1) if total_customers > 0 else 0.0

            # Extract modes for each feature
            centroids = self.model.cluster_centroids_[c_id]
            mode_dict = {self.features[i]: str(centroids[i]) for i in range(len(self.features))}

            # Metrics
            avg_rating = round(float(c_df['Rating'].mean()), 2) if c_count > 0 else 3.0
            
            # Sentiment breakdown
            if 'Sentiment' in c_df.columns and c_count > 0:
                pos_pct = round(float((c_df['Sentiment'] == 'Positive').sum() / c_count * 100), 1)
                neu_pct = round(float((c_df['Sentiment'] == 'Neutral').sum() / c_count * 100), 1)
                neg_pct = round(float((c_df['Sentiment'] == 'Negative').sum() / c_count * 100), 1)
            else:
                pos_pct, neu_pct, neg_pct = 33.3, 33.3, 33.4

            # Dynamic Segment Title and Strategy Generation
            title, icon, description, strategy = self._generate_cluster_persona(
                mode_dict, avg_rating, pos_pct, neg_pct, c_df
            )
            
            # Prevent duplicate segment titles if multiple clusters share archetype
            final_title = title
            if final_title in used_titles:
                final_title = f"{title} ({mode_dict.get('Product_Category', 'General')})"
            used_titles.add(final_title)

            profile = {
                "cluster_id": c_id,
                "segment_name": final_title,
                "icon": icon,
                "customer_count": c_count,
                "percentage": c_percent,
                "average_rating": avg_rating,
                "most_common_membership": mode_dict.get('Membership', 'None'),
                "most_common_frequency": mode_dict.get('Purchase_Frequency', 'Regular'),
                "most_common_category": mode_dict.get('Product_Category', 'General'),
                "most_common_payment": mode_dict.get('Payment_Method', 'UPI'),
                "most_common_discount": mode_dict.get('Discount_Usage', 'No'),
                "most_common_age_group": mode_dict.get('Age_Group', '26-35'),
                "most_common_location": mode_dict.get('Location', 'Metro'),
                "mode_features": mode_dict,
                "sentiment_distribution": {
                    "positive_percentage": pos_pct,
                    "neutral_percentage": neu_pct,
                    "negative_percentage": neg_pct
                },
                "profile_description": description,
                "business_recommendation": strategy
            }
            profiles.append(profile)

        self.cluster_profiles = profiles
        return {
            "n_clusters": self.n_clusters,
            "total_customers": total_customers,
            "cost": self.cost_,
            "profiles": profiles
        }

    def _generate_cluster_persona(self, modes: Dict[str, str], avg_rating: float,
                                 pos_pct: float, neg_pct: float, c_df: pd.DataFrame):
        """
        Dynamically derives segment naming and marketing recommendation
        based on cluster modes and behavioral metrics.
        """
        membership = modes.get('Membership', '')
        freq = modes.get('Purchase_Frequency', '')
        discount = modes.get('Discount_Usage', '')
        category = modes.get('Product_Category', '')
        payment = modes.get('Payment_Method', '')

        # Decision heuristic for archetypes
        if (membership in ['Platinum', 'Gold']) or (avg_rating >= 4.3 and pos_pct >= 60.0):
            title = "Premium VIP Loyalists"
            icon = "👑"
            description = (
                f"High-tier {membership} members who make {freq.lower()} purchases primarily in {category}. "
                f"They value premium service, maintain a high average rating of {avg_rating}★, and exhibit low discount dependency."
            )
            strategy = (
                "Provide white-glove concierge support, invite-only preview access to flagship launches, "
                "accelerated loyalty reward points, and personalized premium gifting."
            )
        elif avg_rating <= 2.8 or neg_pct >= 40.0:
            title = "At-Risk & Churn-Prone Shoppers"
            icon = "⚠️"
            description = (
                f"Customers with low customer satisfaction ({avg_rating}★ avg rating, {neg_pct}% negative feedback). "
                f"Predominantly purchasing {category} with {freq.lower()} activity, frequently using {payment}."
            )
            strategy = (
                "Deploy proactive post-delivery follow-ups, express refund resolution, dedicated satisfaction surveys, "
                "and targeted win-back vouchers with quality assurance guarantees."
            )
        elif discount in ['Yes', 'High'] or (payment in ['UPI', 'Cash on Delivery'] and membership in ['Bronze', 'None']):
            title = "Budget & Deal Hunters"
            icon = "🏷️"
            description = (
                f"Price-conscious shoppers with {discount.lower()} discount responsiveness. "
                f"Regularly browsing {category} and preferring payment via {payment}."
            )
            strategy = (
                "Leverage flash deals, festival sale bundles, cashback incentives for digital payments, "
                "and tiered threshold discounts ('Buy 2 Get 1 Free') to maximize cart size."
            )
        else:
            title = "Occasional Lifestyle Buyers"
            icon = "🎯"
            description = (
                f"Infrequent or steady shoppers engaging in {category} purchases with balanced sentiment ({pos_pct}% positive). "
                f"Typically holding {membership} status and purchasing on an {freq.lower()} cadence."
            )
            strategy = (
                "Re-engage via personalized category newsletters, seasonal reminders, "
                "time-limited checkout coupons, and low-friction one-click reordering."
            )

        return title, icon, description, strategy

    def predict_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assigns a new customer to the closest cluster mode and returns match insights.
        """
        if not self.is_trained or self.model is None:
            raise ValueError("K-Modes model is not yet trained. Please run segmentation first.")

        # Prepare feature vector in exact order
        feature_vals = [str(customer_data.get(feat, '')).strip() for feat in self.features]
        X_new = np.array([feature_vals])

        cluster_idx = int(self.model.predict(X_new)[0])
        winning_profile = self.cluster_profiles[cluster_idx]

        # Calculate matching attributes with cluster centroid
        centroid = self.model.cluster_centroids_[cluster_idx]
        matches = []
        mismatches = []
        
        for idx, feat in enumerate(self.features):
            val = feature_vals[idx]
            mode_val = centroid[idx]
            if val.lower() == mode_val.lower():
                matches.append(f"{feat}: {val}")
            else:
                mismatches.append(f"{feat} ({val} vs mode {mode_val})")

        match_confidence = round((len(matches) / len(self.features) * 100), 1)

        return {
            "cluster_number": cluster_idx,
            "predicted_segment": winning_profile["segment_name"],
            "icon": winning_profile["icon"],
            "confidence_percentage": match_confidence,
            "matching_characteristics": matches,
            "divergent_characteristics": mismatches,
            "recommended_action": winning_profile["business_recommendation"],
            "cluster_profile": winning_profile
        }
