"""
Script to generate a rich, realistic e-commerce customer segmentation dataset.
Contains 600+ records with diverse, realistic categorical distributions
that yield genuine, interpretable K-Modes clusters.
"""
import random
import pandas as pd

random.seed(42)

# Candidate values for attributes
GENDERS = ["Female", "Male", "Other"]
AGE_GROUPS = ["18-25", "26-35", "36-50", "50+"]
LOCATIONS = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"]

# Realistic customer archetypes to ensure natural mode concentrations
# Each archetype has probabilistic preferences for categorical attributes
ARCHETYPES = [
    {
        "name": "Premium High-Value Loyalists",
        "weight": 0.28,
        "memberships": ["Platinum", "Gold", "Platinum", "Gold", "Silver"],
        "frequencies": ["Frequent", "Frequent", "Regular"],
        "payments": ["Credit Card", "Credit Card", "UPI", "Net Banking"],
        "categories": ["Electronics", "Fashion", "Beauty & Personal Care"],
        "discounts": ["No", "No", "Low"],
        "ratings": [5, 5, 4, 5, 4],
        "feedbacks": [
            "The product quality was excellent and packaging was top-notch.",
            "Outstanding experience and lightning-fast next-day delivery!",
            "Top-tier craftsmanship, always my preferred platform for luxury items.",
            "Exceptional customer service, resolved my inquiry within minutes.",
            "Flawless shopping experience, the premium membership benefits are worth it.",
            "Superior product build, completely exceeded my expectations!",
            "Consistently reliable quality, very happy with this purchase.",
            "Superb packaging and genuine brand warranty included."
        ]
    },
    {
        "name": "Budget & Bargain Seekers",
        "weight": 0.32,
        "memberships": ["Bronze", "None", "None", "Bronze", "Silver"],
        "frequencies": ["Regular", "Occasional", "Frequent"],
        "payments": ["UPI", "Cash on Delivery", "Debit Card", "UPI"],
        "categories": ["Fashion", "Home & Kitchen", "Books & Stationery"],
        "discounts": ["Yes", "Yes", "High"],
        "ratings": [4, 3, 4, 3, 5],
        "feedbacks": [
            "Great discount during the festive flash sale, decent product.",
            "Affordable pricing and reasonable quality for the money spent.",
            "Best value deal I found online compared to other platforms.",
            "Good product considering the discount, but packaging was plain.",
            "Pocket-friendly prices, worth buying if coupons are applied.",
            "Decent quality for daily use, coupon code made it very cheap.",
            "Satisfied with the discount, though delivery took 4 days.",
            "Great budget option, met my basic expectations for the price."
        ]
    },
    {
        "name": "Occasional Lifestyle Buyers",
        "weight": 0.22,
        "memberships": ["Silver", "Bronze", "None", "Silver"],
        "frequencies": ["Occasional", "Occasional", "Rare"],
        "payments": ["Debit Card", "UPI", "Net Banking", "Cash on Delivery"],
        "categories": ["Beauty & Personal Care", "Books & Stationery", "Sports & Fitness"],
        "discounts": ["Sometimes", "Moderate", "No"],
        "ratings": [3, 4, 3, 4, 3],
        "feedbacks": [
            "Satisfactory purchase, nothing extraordinary but works fine.",
            "Average shopping experience, arrived on time as expected.",
            "The item matches the description, decent for occasional use.",
            "Standard delivery speed, okay product quality overall.",
            "Fair experience, will consider ordering again when needed.",
            "Normal quality item, serves the intended purpose well.",
            "Average customer support response, product is okay.",
            "Balanced quality for the price, neither great nor bad."
        ]
    },
    {
        "name": "At-Risk & Discontented Shoppers",
        "weight": 0.18,
        "memberships": ["None", "Bronze", "None", "Silver"],
        "frequencies": ["Rare", "Rare", "Occasional"],
        "payments": ["Cash on Delivery", "Cash on Delivery", "Debit Card", "UPI"],
        "categories": ["Electronics", "Home & Kitchen", "Fashion"],
        "discounts": ["Yes", "No", "High"],
        "ratings": [1, 2, 2, 1, 3],
        "feedbacks": [
            "Delivery was delayed by a week and the outer box was damaged.",
            "Customer support was unhelpful, very disappointing return process.",
            "Item did not match pictures shown on website, low quality material.",
            "Defective piece received, took forever to get a replacement.",
            "Very frustrating experience, refund took over 10 days to process.",
            "Poor build quality, stopped working within two weeks of use.",
            "Not recommended at all, delivery executive was extremely rude.",
            "Misleading product description and late dispatch, very unhappy."
        ]
    }
]

def generate_dataset(num_records=600):
    records = []
    
    # Calculate counts per archetype
    for i in range(num_records):
        archetype = random.choices(
            ARCHETYPES,
            weights=[a["weight"] for a in ARCHETYPES]
        )[0]
        
        cid = f"C{1001 + i}"
        gender = random.choice(GENDERS)
        age_group = random.choice(AGE_GROUPS)
        location = random.choice(LOCATIONS)
        membership = random.choice(archetype["memberships"])
        purchase_freq = random.choice(archetype["frequencies"])
        payment = random.choice(archetype["payments"])
        product_cat = random.choice(archetype["categories"])
        discount = random.choice(archetype["discounts"])
        rating = random.choice(archetype["ratings"])
        feedback = random.choice(archetype["feedbacks"])
        
        # Add slight natural noise/variation (10% probability of cross-category crossover)
        if random.random() < 0.08:
            membership = random.choice(["Gold", "Silver", "Bronze", "None"])
        if random.random() < 0.08:
            payment = random.choice(["Credit Card", "Debit Card", "UPI", "Cash on Delivery", "Net Banking"])

        records.append({
            "Customer_ID": cid,
            "Gender": gender,
            "Age_Group": age_group,
            "Location": location,
            "Membership": membership,
            "Purchase_Frequency": purchase_freq,
            "Payment_Method": payment,
            "Product_Category": product_cat,
            "Discount_Usage": discount,
            "Feedback": feedback,
            "Rating": rating
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_dataset(600)
    output_path = "backend/data/customers.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} customer records saved to {output_path}")
    print(df.head())
