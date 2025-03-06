from fastapi import FastAPI
import pandas as pd

app = FastAPI()

@app.get("/drugs")
def get_drugs():
    df = pd.read_csv("medicines.csv")  # Replace with the actual CSV file path
    drugs = df["name"].tolist()  # Assuming the CSV has a column named 'drug_name'
    return drugs
