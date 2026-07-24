import random

# Reference ranges for default biomarkers
BIOMARKER_METADATA = {
    "Vitamin D3": {
        "unit": "ng/mL",
        "reference_range": "30 - 100",
        "organ": "bones",
        "description": "Supports calcium absorption, immune health, and bone metabolic density."
    },
    "ALT Enzyme": {
        "unit": "U/L",
        "reference_range": "10 - 40",
        "organ": "liver",
        "description": "Intracellular liver enzyme. Elevation points to hepatic load or inflammatory triggers."
    },
    "Hemoglobin": {
        "unit": "g/dL",
        "reference_range": "13.5 - 17.5",
        "organ": "heart",
        "description": "Heme protein in red blood cells that transports oxygen to metabolic zones."
    },
    "Creatinine": {
        "unit": "mg/dL",
        "reference_range": "0.6 - 1.2",
        "organ": "kidneys",
        "description": "Breakdown waste product filtered and excreted by renal glomeruli."
    },
    "Fasting Glucose": {
        "unit": "mg/dL",
        "reference_range": "70 - 99",
        "organ": "pancreas",
        "description": "Primary monosaccharide fueling cellular respiration and metabolic processes."
    }
}

def parse_report_and_reason(file_name: str):
    """
    Simulates OCR document reading and applies medical NLP rules.
    Injects specific outliers to trigger 'monitor' states for bones (Vitamin D)
    and liver (ALT) to match Mukesh's default profile scenario.
    """
    results = []
    
    # Simulate a typical panel
    for name, meta in BIOMARKER_METADATA.items():
        if name == "Vitamin D3":
            # Low Vitamin D
            val = 18.0
            status = "low"
        elif name == "ALT Enzyme":
            # High ALT
            val = 52.0
            status = "high"
        else:
            # Random normal values within reference range
            low, high = map(float, meta["reference_range"].split(" - "))
            val = round(random.uniform(low, high), 1)
            status = "normal"
            
        results.append({
            "name": name,
            "value": val,
            "unit": meta["unit"],
            "status": status,
            "reference_range": meta["reference_range"],
            "organ": meta["organ"],
            "description": meta["description"]
        })
        
    return results
