import pathlib
from pathlib import Path
import json
import streamlit as st
import pandas as pd
import os
import stripe
import dotenv
from datetime import datetime
from dotenv import load_dotenv

#Directories and file paths
THIS_DIR = Path.cwd()   # gets current working directory
print(THIS_DIR)
CSS_FILE=THIS_DIR/'styles.css'
assets=THIS_DIR/'gaza_food_donation.json'
gaza_food_donation=assets/'gaza_food_donation.json'

#Function to load and display Gaza food donation
def load_gaza_food_donation(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

# Function to get the name from query parameters
def get_person_name():
    query_params = st.experimental_get_query_params()
    return query_params.get('name', ['Friend'])[0]

#Page configuration
st.set_page_config(page_title='Gaza Food Donation',page_icon='🙏')


#Apply custom CSS
with open(CSS_FILE) as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


#Display header with personalized name
PERSON_NAME=get_person_name()
st.header(f"Donate Food to {PERSON_NAME} 🤝", anchor=False)


#Display the Gaza donation
gaza_donation=load_gaza_food_donation('file_path')
st.image(gaza_donation,key='gaza_food_donation',height=300)

#Personalized message
st.markdown(
f'Dear friend, I wish you good life with peace.'
)

# Load Stripe keys from .env
load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")

#donation data file
DATA_FILE='donations.csv'
donations_df=pd.read_csv(DATA_FILE)

# Example donation data
new_donation = {
    "Name": "Alice",
    "Amount": 20,
    "Message": "With love 💖",
    "Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}

#Load existing donations
try:
    donations_df=pd.read_csv(DATA_FILE)
except FileNotFoundError:
    donations_df=pd.DataFrame(columns=['Name','Amount','Message','Date'])

# Donation form
with st.form("donation_form"):
    name = st.text_input("Your Name", placeholder="John Mark")
    amount = st.number_input("Donation Amount (USD)", min_value=1.0, step=1.0)
    message = st.text_area("Message (optional)")
    submitted = st.form_submit_button("Proceed to Payment 💳")
    
if submitted:
    #create stripe Checkout session
    session=stripe.checkout.Session.create(
    payment_method_types['card'],
    line_items=[{'price_data':{
    'currency':'usd',
    'product_data':{'name': f"Donation from {name or 'Anonymous'}"},
    'unit_amount': int(amount *100),
    # Amount in cents
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url="http://localhost:8501?success=true",
        cancel_url="http://localhost:8501?canceled=true",
    )

if submitted:
    # Save the donation intent locally
    new_donation = {
    "Name": name if name else "Anonymous",
    "Amount": amount,
    "Message": message,
    "Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}

donations_df = pd.concat([donations_df, pd.DataFrame([new_donation])], ignore_index=True)
donations_df.to_csv(DATA_FILE, index=False)

# Redirect user to Stripe payment page
st.markdown(f"[Click here to complete your donation]({session.url})", unsafe_allow_html=True)

# Display donations
st.subheader("Recent Donations")
for _, row in donations_df.sort_values(by="Date", ascending=False).head(5).iterrows():
    st.markdown(f"""
        <div class="donation-card">
            <b>{row['Name']}</b> donated <b>${row['Amount']}</b><br>
            <i>{row['Message']}</i><br>
            <small>{row['Date']}</small>
        </div>
    """, unsafe_allow_html=True)      
