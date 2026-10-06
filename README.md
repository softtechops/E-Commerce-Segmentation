# SmartCart – E-Commerce Customer Segmentation & Feedback Analytics

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![ML](https://img.shields.io/badge/Algorithm-K--Modes%20Clustering-orange.svg)](https://github.com/nicodv/kmodes)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> A full-stack machine learning web application specifically built for **categorical e-commerce customer segmentation** and **explainable customer feedback sentiment analytics**.

---

## 1. Project Overview

In real-world e-commerce platforms, customer records are primarily dominated by discrete categorical attributes—such as membership status, preferred payment methods, shopping frequency, product categories, and geographical locations. Traditional clustering models like K-Means calculate Euclidean distances and numerical averages, which fail on non-numerical data and generate meaningless fractional categories (e.g., *Membership Tier = 1.4*).

**SmartCart** implements a complete, transparent categorical clustering solution powered by the **K-Modes algorithm** (using Huang centroid initialization and Hamming dissimilarity). Additionally, it integrates a deterministic, explainable Natural Language Processing (NLP) feedback sentiment analyzer and an instant prediction engine that delivers tailored marketing playbooks for each customer segment.

---

## 2. Key Features

- **🧠 Categorical K-Modes Clustering Engine**:
  - Dynamically clusters discrete customer records without one-hot distortion.
  - Supports user-configurable cluster counts ($k = 2$ to $6$, default $4$).
  - Derives dynamic persona names (*Premium VIP Loyalists*, *Budget Deal Hunters*, *Occasional Lifestyle Buyers*, *At-Risk Churn-Prone Shoppers*) based on cluster modes.
- **💬 Explainable Feedback Sentiment Analytics**:
  - 100% offline, zero-cost, transparent rule-and-lexicon-based NLP.
  - Handles negation ("not good" $\to$ negative), intensifiers, and rating cross-calibration.
  - Calculates sentiment proportions and displays a searchable feedback review directory.
- **🔮 Real-Time New Customer Prediction**:
  - Instant classification of prospective customers against trained cluster centroids.
  - Calculates match confidence and provides actionable business strategies.
  - Includes one-click quick-fill presets for academic viva demonstrations.
- **📊 Modern SaaS Analytics Dashboard**:
  - Interactive Chart.js visualizations (segment doughnut, sentiment donut, membership tiers, purchase frequency, product category rankings).
  - Data preprocessing audit trail (records tracked, duplicates dropped, missing values imputed).
  - Paginated customer table with multi-attribute filtering (membership, location, segment, sentiment).
- **🚀 1-Click Demo Ready**:
  - Includes a preloaded 600-record realistic e-commerce dataset for offline viva demonstrations.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 (Vite 8 build tool)
- **Styling**: Warm Editorial Design System (Warm off-white #F7F5F0, deep forest green #1B4332, DM Sans typography, whitespace-driven layout)
- **Charts**: Minimalist Chart.js 4 with custom warm palette (Forest green, Amber, Terracotta, Olive)
- **Icons**: Lucide React line icons

### Backend
- **Framework**: Python 3.13 + Flask 3.1
- **API Architecture**: RESTful JSON endpoints with Flask-CORS
- **Server**: WSGI development server with proxy routing

### Machine Learning & Data Science
- **Clustering**: `kmodes` (Huang initialization, Hamming distance metric)
- **Data Manipulation**: Pandas 2, NumPy
- **Preprocessing & Metrics**: Scikit-Learn

---

## 4. Why K-Modes instead of K-Means? (Academic Rationale)

A frequent viva question in machine learning project evaluations is: *Why not use K-Means?*

| Feature | Standard K-Means | K-Modes Clustering (SmartCart) |
| :--- | :--- | :--- |
| **Data Nature** | Numerical, continuous data | Discrete categorical / nominal data |
| **Dissimilarity Metric** | Euclidean distance $d(x,y) = \sqrt{\sum (x_i - y_i)^2}$ | Simple matching Hamming distance: $D(X, Q) = \sum_{j=1}^m \delta(x_j, q_j)$ |
| **Centroid Definition** | Arithmetic mean vector | Mode vector (most frequent categorical values) |
| **Geometric Distortion** | Fails on categorical codes; produces non-existent averages | Preserves true categorical attributes |
| **Sparse Matrix Overhead** | Suffers from curse of dimensionality with One-Hot | Operates directly on native categorical dimensions |

### Mathematical Formulation
The objective cost function minimized by K-Modes is:
$$P(W, Q) = \sum_{l=1}^k \sum_{i=1}^n w_{il} \sum_{j=1}^m \delta(x_{ij}, q_{lj})$$

Where:
- $W = [w_{il}]$ is an $n \times k$ partition matrix ($w_{il} \in \{0, 1\}$).
- $Q_l = [q_{l1}, q_{l2}, \dots, q_{lm}]$ is the mode centroid vector for cluster $l$.
- $\delta(x_{ij}, q_{lj}) = 0$ if $x_{ij} = q_{lj}$ (match), and $1$ if mismatch.

---

## 5. Dataset Description

The bundled dataset (`backend/data/customers.csv`) contains 600 diverse, realistic e-commerce customer records across 11 columns:

| Column | Type | Example Values |
| :--- | :--- | :--- |
| `Customer_ID` | Identifier | C1001, C1002, ... |
| `Gender` | Categorical | Female, Male, Other |
| `Age_Group` | Categorical | 18-25, 26-35, 36-50, 50+ |
| `Location` | Categorical | Mumbai, Delhi, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad |
| `Membership` | Categorical | Platinum, Gold, Silver, Bronze, None |
| `Purchase_Frequency` | Categorical | Frequent, Regular, Occasional, Rare |
| `Payment_Method` | Categorical | Credit Card, UPI, Debit Card, Net Banking, Cash on Delivery |
| `Product_Category` | Categorical | Electronics, Fashion, Beauty & Personal Care, Home & Kitchen, Sports & Fitness, Books |
| `Discount_Usage` | Categorical | High, Moderate, Low, No, Yes, Sometimes |
| `Feedback` | Text review | "The product quality was excellent and packaging was top-notch." |
| `Rating` | Integer | 1, 2, 3, 4, 5 Stars |

---

## 6. Folder Structure

```
PS-4/
├── backend/
│   ├── app.py                      # Flask REST API server and routing
│   ├── requirements.txt            # Python dependencies
│   ├── data/
│   │   ├── customers.csv           # 600-record realistic sample dataset
│   │   └── generate_dataset.py     # Script to generate balanced customer archetypes
│   ├── models/                     # Saved model artifacts
│   ├── services/
│   │   ├── preprocessing.py        # Data validation, cleaning, missing value handling
│   │   ├── clustering.py           # K-Modes model, dynamic profiling, prediction
│   │   └── feedback.py             # Rule-based explainable NLP sentiment analyzer
│   └── utils/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChartComponent.jsx  # Reusable Chart.js responsive canvas component
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Attractive Hero & 3-pillar feature showcase
│   │   │   ├── OverviewPage.jsx    # KPI cards and 5 interactive charts
│   │   │   ├── CustomerDataPage.jsx# Directory table with filters, search, CSV upload
│   │   │   ├── SegmentationPage.jsx# K-Modes execution, cluster size chart & summary
│   │   │   ├── FeedbackPage.jsx    # Sentiment breakdown & feedback logs table
│   │   │   ├── InsightsPage.jsx    # Detailed cluster persona cards & marketing strategies
│   │   │   ├── PredictPage.jsx     # Real-time customer prediction form & presets
│   │   │   └── AboutPage.jsx       # Academic viva technical documentation
│   │   ├── api.js                  # Frontend client communicating with REST API
│   │   ├── App.jsx                 # Main layout, sidebar navigation, toast alerts
│   │   ├── index.css               # Design system & dark mode CSS variables
│   │   └── main.jsx
│   ├── index.html                  # HTML entry point with Google Fonts
│   ├── package.json
│   └── vite.config.js              # Vite server configuration with API proxy
│
├── README.md                       # Comprehensive project documentation
└── .gitignore
```

---

## 7. Installation & Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node.js 24)

### 1. Clone or Open Workspace
```bash
cd PS-4
```

### 2. Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```

---

## 8. How to Run

### Step 1: Start Backend API (Port 5000)
In your first terminal:
```bash
python backend/app.py
```
*Backend runs at `http://127.0.0.1:5000` and automatically preloads the sample dataset.*

### Step 2: Start Frontend Development Server (Port 5173)
In your second terminal:
```bash
cd frontend
npm run dev
```
*Frontend runs at `http://localhost:5173` with an automatic proxy forwarding `/api` calls to the Flask backend.*

Open `http://localhost:5173` in any modern web browser.

---

## 9. Example Viva Demonstration Flow

Demonstrate the project smoothly in this recommended order:

1. **Landing Page**:
   - Showcase the headline: *"Understand Your Customers. Grow Your Business."*
   - Highlight the 3 core pillars: K-Modes Segmentation, Feedback Analytics, Customer Prediction.
2. **Overview Dashboard**:
   - Click **"Explore Dashboard"**.
   - Show the 4 KPI cards (600 Customers, 4 Segments, 4.1★ Average Rating, 68% Positive Feedback).
   - Review the Data Pipeline Audit Card and 5 interactive charts.
3. **Customer Data Directory**:
   - Navigate to **"Customer Data"**.
   - Demonstrate the search bar (e.g. search for `Mumbai` or `Electronics`).
   - Filter by Membership (`Platinum`) and Sentiment (`Positive`).
   - Mention CSV upload support and 1-click **"Load Demo Data"**.
4. **Feedback Analytics**:
   - Navigate to **"Feedback Analytics"**.
   - Point out the sentiment donut chart and rating bar chart.
   - Inspect the review logs table with verified star ratings and sentiment badges.
5. **K-Modes Segmentation**:
   - Navigate to **"Segmentation"**.
   - Show the cluster selector ($k = 2$ to $6$).
   - Click **"Run K-Modes Segmentation"** to trigger live clustering with celebration confetti.
   - Review the cluster summary table showing mode values for each category.
6. **Cluster Personas & Insights**:
   - Navigate to **"Cluster Insights"**.
   - Explain how each card is dynamically generated:
     - 👑 **Premium VIP Loyalists**: Platinum/Gold tier, frequent buyer, high satisfaction. Strategy: White-glove concierge and private previews.
     - 🏷️ **Budget Deal Hunters**: High discount usage, price-sensitive. Strategy: Flash bundles and cashback.
     - 🎯 **Occasional Lifestyle Buyers**: Moderate cadence. Strategy: Category re-engagement emails.
     - ⚠️ **At-Risk Churn-Prone Shoppers**: High negative feedback, low ratings. Strategy: Proactive outreach and goodwill store credits.
7. **Predict Customer Segment**:
   - Navigate to **"Predict Customer"**.
   - Click one of the quick archetype presets (e.g., **👑 VIP Loyalist** or **⚠️ At-Risk Churn**).
   - Click **"Predict Segment"**.
   - Show the instant prediction result, matching modal characteristics, and recommended action.
8. **About Project**:
   - Open **"About Project"** to present the theoretical comparison between K-Modes and K-Means.

---

## 10. Screenshots Placeholder

| Landing Page | Overview Dashboard |
| :---: | :---: |
| *(Hero section with 3 core pillars)* | *(KPI cards & 5 interactive charts)* |

| K-Modes Segmentation | Customer Prediction Engine |
| :---: | :---: |
| *(Dynamic cluster summary table)* | *(Attribute input form & match confidence)* |

---

## 11. Future Enhancements

- Integration of **K-Prototypes** clustering to seamlessly handle datasets containing mixed categorical and continuous numerical variables.
- Automated Elbow Method / Average Silhouette heuristics for optimal $k$ recommendation.
- Direct export of segmented customer lists to CRM platforms (HubSpot, Mailchimp, Klaviyo).
- Multi-language customer review parsing using lightweight local transformer models.

---

## 12. License & Academic Attribution
Developed as an academic machine learning full-stack project demonstrating categorical unsupervised clustering, explainable NLP, and interactive data visualization.
