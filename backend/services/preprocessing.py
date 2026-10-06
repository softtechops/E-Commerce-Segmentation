"""
Data Preprocessing Pipeline for SmartCart
Handles data validation, cleaning, missing value imputation,
categorical normalization, and prepares datasets for K-Modes clustering.
"""
import pandas as pd
import numpy as np

# Core categorical features utilized for K-Modes clustering
CATEGORICAL_FEATURES = [
    'Gender',
    'Age_Group',
    'Location',
    'Membership',
    'Purchase_Frequency',
    'Payment_Method',
    'Product_Category',
    'Discount_Usage'
]

REQUIRED_COLUMNS = [
    'Customer_ID',
    'Gender',
    'Age_Group',
    'Location',
    'Membership',
    'Purchase_Frequency',
    'Payment_Method',
    'Product_Category',
    'Discount_Usage',
    'Feedback',
    'Rating'
]

# Standard allowed values for normalization and sanity checking
VALID_VALUES = {
    'Gender': ['Female', 'Male', 'Other'],
    'Age_Group': ['18-25', '26-35', '36-50', '50+'],
    'Membership': ['Platinum', 'Gold', 'Silver', 'Bronze', 'None'],
    'Purchase_Frequency': ['Frequent', 'Regular', 'Occasional', 'Rare'],
    'Payment_Method': ['Credit Card', 'UPI', 'Debit Card', 'Net Banking', 'Cash on Delivery'],
    'Discount_Usage': ['Yes', 'No', 'High', 'Moderate', 'Low', 'Sometimes']
}

def validate_dataframe(df: pd.DataFrame):
    """
    Validates that required columns exist in the DataFrame.
    Returns (is_valid: bool, error_message: str)
    """
    if df.empty:
        return False, "Uploaded file contains an empty dataset."
    
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        return False, f"Missing required columns: {', '.join(missing_cols)}"
        
    return True, ""

def preprocess_customer_data(df: pd.DataFrame):
    """
    Executes a complete preprocessing pipeline:
    1. Tracks original stats
    2. Drops exact duplicates
    3. Handles missing values across categorical and numeric fields
    4. Normalizes text formatting
    5. Cleans and bounds ratings
    6. Returns cleaned DataFrame and preprocessing summary metrics
    """
    original_records = len(df)
    missing_counts = int(df.isna().sum().sum())
    
    # 1. Drop duplicate customer records
    cleaned_df = df.copy()
    cleaned_df.drop_duplicates(subset=['Customer_ID'], keep='first', inplace=True)
    duplicates_removed = original_records - len(cleaned_df)
    
    # 2. Handle missing and invalid categorical values
    for col in CATEGORICAL_FEATURES:
        if col in cleaned_df.columns:
            # Impute missing values with column mode or 'Unknown'
            mode_val = cleaned_df[col].mode().iloc[0] if not cleaned_df[col].dropna().empty else "Unknown"
            cleaned_df[col] = cleaned_df[col].fillna(mode_val)
            # Strip whitespace and normalize capitalization
            cleaned_df[col] = cleaned_df[col].astype(str).str.strip()
            # Standardize case if matching standard sets
            cleaned_df[col] = cleaned_df[col].apply(lambda x: x.title() if x.lower() not in ['upi', 'cod'] else x.upper())
    
    # Standardize specific acronyms
    if 'Payment_Method' in cleaned_df.columns:
        cleaned_df['Payment_Method'] = cleaned_df['Payment_Method'].replace({
            'Upi': 'UPI',
            'Cod': 'Cash on Delivery',
            'Creditcard': 'Credit Card',
            'Debitcard': 'Debit Card',
            'Netbanking': 'Net Banking'
        })
        
    # 3. Handle Rating
    if 'Rating' in cleaned_df.columns:
        cleaned_df['Rating'] = pd.to_numeric(cleaned_df['Rating'], errors='coerce').fillna(3.0)
        cleaned_df['Rating'] = cleaned_df['Rating'].clip(lower=1, upper=5).round().astype(int)
    else:
        cleaned_df['Rating'] = 3
        
    # 4. Handle Feedback text
    if 'Feedback' in cleaned_df.columns:
        cleaned_df['Feedback'] = cleaned_df['Feedback'].fillna("No review provided").astype(str).str.strip()
    else:
        cleaned_df['Feedback'] = "No review provided"
        
    # Summary of preprocessing steps for dashboard
    summary = {
        "original_records": int(original_records),
        "cleaned_records": int(len(cleaned_df)),
        "duplicates_removed": int(duplicates_removed),
        "missing_values_handled": int(missing_counts),
        "categorical_features": CATEGORICAL_FEATURES,
        "num_categorical_features": len(CATEGORICAL_FEATURES)
    }
    
    return cleaned_df, summary
