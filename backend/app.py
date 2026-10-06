"""
SmartCart - Flask REST API Backend
Provides endpoints for CSV upload, data preprocessing, K-Modes categorical clustering,
sentiment analysis of feedback, customer segmentation, and real-time customer segment prediction.
"""
import os
import sys
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# Ensure root workspace directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.services.preprocessing import preprocess_customer_data, validate_dataframe, CATEGORICAL_FEATURES
from backend.services.feedback import process_feedback_dataset, analyze_sentiment
from backend.services.clustering import CustomerClusteringModel

app = Flask(__name__)
# Enable CORS for frontend Vite development server and all origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global in-memory storage for active session
app_state = {
    "df": None,
    "preprocessing_summary": None,
    "feedback_summary": None,
    "clustering_model": CustomerClusteringModel(n_clusters=4),
    "segmentation_results": None
}

DATA_FILE_PATH = os.path.join(current_dir, "data", "customers.csv")

def initialize_with_sample_data():
    """Loads the sample dataset and performs initial preprocessing & clustering"""
    if os.path.exists(DATA_FILE_PATH):
        try:
            raw_df = pd.read_csv(DATA_FILE_PATH)
            cleaned_df, prep_summary = preprocess_customer_data(raw_df)
            fb_summary = process_feedback_dataset(cleaned_df)
            
            # Train default 4-cluster model
            model = CustomerClusteringModel(n_clusters=4)
            seg_results = model.train(cleaned_df)
            
            # Store in state
            app_state["df"] = cleaned_df
            app_state["preprocessing_summary"] = prep_summary
            app_state["feedback_summary"] = fb_summary
            app_state["clustering_model"] = model
            app_state["segmentation_results"] = seg_results
            print(f"[SmartCart] Initialized with {len(cleaned_df)} sample customer records.")
        except Exception as e:
            print(f"[SmartCart] Warning: could not pre-load sample data: {e}")

# Initialize on startup
initialize_with_sample_data()

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "SmartCart – Customer Segmentation & Feedback Analytics API",
        "version": "1.0.0",
        "model_trained": app_state["clustering_model"].is_trained,
        "customer_count": len(app_state["df"]) if app_state["df"] is not None else 0
    })

@app.route("/api/load-demo", methods=["POST"])
def load_demo_data():
    """Loads or reloads the bundled sample dataset"""
    try:
        if not os.path.exists(DATA_FILE_PATH):
            return jsonify({"success": False, "error": "Sample data file not found."}), 404

        raw_df = pd.read_csv(DATA_FILE_PATH)
        cleaned_df, prep_summary = preprocess_customer_data(raw_df)
        fb_summary = process_feedback_dataset(cleaned_df)
        
        # Train default 4-cluster K-Modes model
        model = CustomerClusteringModel(n_clusters=4)
        seg_results = model.train(cleaned_df)

        app_state["df"] = cleaned_df
        app_state["preprocessing_summary"] = prep_summary
        app_state["feedback_summary"] = fb_summary
        app_state["clustering_model"] = model
        app_state["segmentation_results"] = seg_results

        return jsonify({
            "success": True,
            "message": f"Successfully loaded and clustered {len(cleaned_df)} sample customer records.",
            "preprocessing": prep_summary,
            "feedback": fb_summary,
            "segmentation": seg_results
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to load demo data: {str(e)}"}), 500

@app.route("/api/upload", methods=["POST"])
def upload_csv():
    """Uploads a customer CSV file and runs preprocessing and feedback analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file uploaded. Please choose a CSV file."}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "Empty filename provided."}), 400

        if not file.filename.endswith('.csv'):
            return jsonify({"success": False, "error": "Invalid file format. Please upload a CSV file."}), 400

        try:
            raw_df = pd.read_csv(file)
        except Exception:
            return jsonify({"success": False, "error": "Could not parse CSV file. Ensure it is a valid CSV."}), 400

        # Validate columns
        is_valid, err_msg = validate_dataframe(raw_df)
        if not is_valid:
            return jsonify({"success": False, "error": err_msg}), 400

        # Clean and preprocess
        cleaned_df, prep_summary = preprocess_customer_data(raw_df)
        fb_summary = process_feedback_dataset(cleaned_df)

        # Train K-Modes model with default 4 clusters
        model = CustomerClusteringModel(n_clusters=4)
        seg_results = model.train(cleaned_df)

        app_state["df"] = cleaned_df
        app_state["preprocessing_summary"] = prep_summary
        app_state["feedback_summary"] = fb_summary
        app_state["clustering_model"] = model
        app_state["segmentation_results"] = seg_results

        return jsonify({
            "success": True,
            "message": f"Uploaded and cleaned {len(cleaned_df)} customer records successfully.",
            "preprocessing": prep_summary,
            "feedback": fb_summary,
            "segmentation": seg_results
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing file: {str(e)}"}), 500

@app.route("/api/segment", methods=["POST"])
def run_segmentation():
    """Runs K-Modes clustering on current dataset with specified number of clusters (2-6)"""
    try:
        if app_state["df"] is None or app_state["df"].empty:
            return jsonify({"success": False, "error": "No dataset loaded. Please upload data or load demo data first."}), 400

        data = request.get_json(silent=True) or {}
        n_clusters = int(data.get("n_clusters", 4))

        if n_clusters < 2 or n_clusters > 6:
            return jsonify({"success": False, "error": "Number of clusters must be between 2 and 6."}), 400

        model = CustomerClusteringModel(n_clusters=n_clusters)
        seg_results = model.train(app_state["df"])

        app_state["clustering_model"] = model
        app_state["segmentation_results"] = seg_results

        return jsonify({
            "success": True,
            "message": f"K-Modes clustering completed successfully with {n_clusters} clusters.",
            "segmentation": seg_results
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Clustering failed: {str(e)}"}), 500

@app.route("/api/customers", methods=["GET"])
def get_customers():
    """Returns paginated, searchable, and filterable customer data"""
    try:
        if app_state["df"] is None or app_state["df"].empty:
            return jsonify({"success": False, "error": "No customer data available.", "customers": [], "total": 0})

        df = app_state["df"].copy()

        # Add Segment Name column if clustering has run
        if 'Cluster' in df.columns and app_state["segmentation_results"]:
            profiles = {p['cluster_id']: p['segment_name'] for p in app_state["segmentation_results"]['profiles']}
            df['Segment_Name'] = df['Cluster'].map(profiles)
        else:
            df['Segment_Name'] = "Unassigned"

        # Search filter
        search_query = request.args.get("search", "").strip().lower()
        if search_query:
            df = df[
                df['Customer_ID'].str.lower().str.contains(search_query, na=False) |
                df['Location'].str.lower().str.contains(search_query, na=False) |
                df['Product_Category'].str.lower().str.contains(search_query, na=False) |
                df['Feedback'].str.lower().str.contains(search_query, na=False)
            ]

        # Membership filter
        membership = request.args.get("membership", "").strip()
        if membership and membership != "All":
            df = df[df['Membership'].str.lower() == membership.lower()]

        # Location filter
        location = request.args.get("location", "").strip()
        if location and location != "All":
            df = df[df['Location'].str.lower() == location.lower()]

        # Sentiment filter
        sentiment = request.args.get("sentiment", "").strip()
        if sentiment and sentiment != "All" and 'Sentiment' in df.columns:
            df = df[df['Sentiment'].str.lower() == sentiment.lower()]

        # Segment filter
        segment = request.args.get("segment", "").strip()
        if segment and segment != "All" and 'Segment_Name' in df.columns:
            df = df[df['Segment_Name'].str.lower() == segment.lower()]

        total_filtered = len(df)

        # Pagination
        page = max(1, int(request.args.get("page", 1)))
        page_size = min(100, max(5, int(request.args.get("page_size", 10))))
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        paginated_df = df.iloc[start_idx:end_idx]
        records = paginated_df.to_dict(orient="records")

        # Extract unique filter values for UI dropdowns
        all_df = app_state["df"]
        filter_options = {
            "memberships": sorted(list(all_df['Membership'].dropna().unique())),
            "locations": sorted(list(all_df['Location'].dropna().unique())),
            "sentiments": ["Positive", "Neutral", "Negative"],
            "segments": [p['segment_name'] for p in app_state["segmentation_results"]['profiles']] if app_state["segmentation_results"] else []
        }

        return jsonify({
            "success": True,
            "total": total_filtered,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_filtered + page_size - 1) // page_size if total_filtered > 0 else 1,
            "customers": records,
            "filters": filter_options
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to retrieve customers: {str(e)}"}), 500

@app.route("/api/clusters", methods=["GET"])
def get_clusters():
    """Returns detailed cluster insights, mode characteristics, and marketing strategies"""
    try:
        if not app_state["clustering_model"].is_trained or not app_state["segmentation_results"]:
            return jsonify({"success": False, "error": "Clusters not yet generated. Run segmentation first."}), 400

        return jsonify({
            "success": True,
            "segmentation": app_state["segmentation_results"]
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error fetching cluster insights: {str(e)}"}), 500

@app.route("/api/feedback", methods=["GET"])
def get_feedback_analytics():
    """Returns feedback analytics, sentiments, ratings, and customer reviews table"""
    try:
        if app_state["df"] is None or app_state["df"].empty:
            return jsonify({"success": False, "error": "No feedback data available."}), 400

        df = app_state["df"]
        summary = app_state["feedback_summary"]

        # Search or filter reviews
        search_query = request.args.get("search", "").strip().lower()
        sentiment_filter = request.args.get("sentiment", "").strip()

        reviews_df = df[['Customer_ID', 'Feedback', 'Sentiment', 'Rating', 'Product_Category']].copy()

        if search_query:
            reviews_df = reviews_df[
                reviews_df['Customer_ID'].str.lower().str.contains(search_query, na=False) |
                reviews_df['Feedback'].str.lower().str.contains(search_query, na=False)
            ]

        if sentiment_filter and sentiment_filter != "All":
            reviews_df = reviews_df[reviews_df['Sentiment'].str.lower() == sentiment_filter.lower()]

        reviews = reviews_df.head(100).to_dict(orient="records")

        return jsonify({
            "success": True,
            "summary": summary,
            "total_reviews": len(reviews_df),
            "reviews": reviews
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Error fetching feedback analytics: {str(e)}"}), 500

@app.route("/api/predict", methods=["POST"])
def predict_customer_segment():
    """Predicts the segment for a single new customer using the trained K-Modes model"""
    try:
        if not app_state["clustering_model"].is_trained:
            return jsonify({
                "success": False,
                "error": "The K-Modes model is not yet trained. Please load dataset and run segmentation first."
            }), 400

        customer_input = request.get_json(silent=True) or {}
        
        # Analyze review feedback sentiment if provided
        feedback_text = customer_input.get("Feedback", "")
        rating_val = int(customer_input.get("Rating", 3))
        sentiment_res = analyze_sentiment(feedback_text, rating_val)

        # Predict cluster via K-Modes
        prediction_result = app_state["clustering_model"].predict_customer(customer_input)
        prediction_result["sentiment_analysis"] = sentiment_res

        return jsonify({
            "success": True,
            "prediction": prediction_result
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Prediction failed: {str(e)}"}), 500

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard_data():
    """Aggregates metrics and distributions for the overview dashboard page"""
    try:
        if app_state["df"] is None or app_state["df"].empty:
            return jsonify({"success": False, "error": "No data available."}), 400

        df = app_state["df"]
        total_customers = len(df)
        total_segments = len(app_state["segmentation_results"]['profiles']) if app_state["segmentation_results"] else 0
        avg_rating = round(float(df['Rating'].mean()), 2) if total_customers > 0 else 0.0
        
        fb = app_state["feedback_summary"] or {}
        pos_pct = fb.get("positive_percentage", 0.0)

        # 1. Customer distribution by segment
        segment_dist = []
        cluster_profiles = []
        if app_state["segmentation_results"]:
            cluster_profiles = app_state["segmentation_results"].get('profiles', [])
            for p in cluster_profiles:
                cat = p.get("most_common_category", "General")
                mem = p.get("most_common_membership", "Standard")
                freq = p.get("most_common_frequency", "Regular")
                disc = p.get("most_common_discount", "None")
                segment_dist.append({
                    "name": p["segment_name"],
                    "cluster_id": p["cluster_id"],
                    "count": p["customer_count"],
                    "percentage": p["percentage"],
                    "icon": p["icon"],
                    "average_rating": p.get("average_rating", 0),
                    "most_common_category": cat,
                    "most_common_membership": mem,
                    "most_common_frequency": freq,
                    "most_common_discount": disc,
                    "key_characteristic": f"{mem} tier • {freq.lower()} {cat.lower()} orders"
                })

        # 2. Feedback sentiment distribution
        sentiment_dist = [
            {"label": "Positive", "count": fb.get("positive_count", 0), "percentage": fb.get("positive_percentage", 0)},
            {"label": "Neutral", "count": fb.get("neutral_count", 0), "percentage": fb.get("neutral_percentage", 0)},
            {"label": "Negative", "count": fb.get("negative_count", 0), "percentage": fb.get("negative_percentage", 0)}
        ]

        # 3. Membership distribution
        membership_dist = df['Membership'].value_counts().reset_index()
        membership_dist.columns = ['membership', 'count']
        membership_dist_list = membership_dist.to_dict(orient="records")

        # 4. Purchase frequency distribution
        freq_dist = df['Purchase_Frequency'].value_counts().reset_index()
        freq_dist.columns = ['frequency', 'count']
        freq_dist_list = freq_dist.to_dict(orient="records")

        # 5. Product category distribution
        cat_dist = df['Product_Category'].value_counts().reset_index()
        cat_dist.columns = ['category', 'count']
        cat_dist_list = cat_dist.to_dict(orient="records")

        return jsonify({
            "success": True,
            "metrics": {
                "total_customers": total_customers,
                "total_segments": total_segments,
                "average_rating": avg_rating,
                "positive_feedback_pct": pos_pct,
                "cost": app_state["clustering_model"].cost_
            },
            "preprocessing": app_state["preprocessing_summary"],
            "segment_distribution": segment_dist,
            "sentiment_distribution": sentiment_dist,
            "membership_distribution": membership_dist_list,
            "frequency_distribution": freq_dist_list,
            "category_distribution": cat_dist_list,
            "cluster_profiles": cluster_profiles
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to load dashboard data: {str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[SmartCart] Flask Backend starting on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
