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
    file_name_lower = file_name.lower()
    
    if "metabolic" in file_name_lower:
        # Glucose high, ALT high
        return [
            {"name": "Fasting Glucose", "value": 145.0, "unit": "mg/dL", "status": "high", "reference_range": "70 - 99", "organ": "pancreas", "description": "Primary monosaccharide fueling cells."},
            {"name": "ALT Enzyme", "value": 58.0, "unit": "U/L", "status": "high", "reference_range": "10 - 40", "organ": "liver", "description": "Liver enzyme indicating processing strain."},
            {"name": "Vitamin D3", "value": 32.0, "unit": "ng/mL", "status": "normal", "reference_range": "30 - 100", "organ": "bones", "description": "Supports calcium absorption and bone density."},
            {"name": "Hemoglobin", "value": 14.5, "unit": "g/dL", "status": "normal", "reference_range": "13.5 - 17.5", "organ": "heart", "description": "Oxygen-carrying protein in red blood cells."},
            {"name": "Creatinine", "value": 0.9, "unit": "mg/dL", "status": "normal", "reference_range": "0.6 - 1.2", "organ": "kidneys", "description": "Waste product filtered by kidneys."}
        ]
    elif "skeletal" in file_name_lower or "bone" in file_name_lower:
        # Vitamin D3 low
        return [
            {"name": "Vitamin D3", "value": 12.0, "unit": "ng/mL", "status": "low", "reference_range": "30 - 100", "organ": "bones", "description": "Supports calcium absorption and bone density."},
            {"name": "Creatinine", "value": 0.8, "unit": "mg/dL", "status": "normal", "reference_range": "0.6 - 1.2", "organ": "kidneys", "description": "Waste product filtered by kidneys."},
            {"name": "Hemoglobin", "value": 14.2, "unit": "g/dL", "status": "normal", "reference_range": "13.5 - 17.5", "organ": "heart", "description": "Oxygen-carrying protein in red blood cells."},
            {"name": "ALT Enzyme", "value": 24.0, "unit": "U/L", "status": "normal", "reference_range": "10 - 40", "organ": "liver", "description": "Liver enzyme indicating processing strain."},
            {"name": "Fasting Glucose", "value": 85.0, "unit": "mg/dL", "status": "normal", "reference_range": "70 - 99", "organ": "pancreas", "description": "Primary monosaccharide fueling cells."}
        ]
    elif "cardio" in file_name_lower or "lipid" in file_name_lower:
        # Hemoglobin low, Creatinine high
        return [
            {"name": "Hemoglobin", "value": 11.2, "unit": "g/dL", "status": "low", "reference_range": "13.5 - 17.5", "organ": "heart", "description": "Oxygen-carrying protein in red blood cells."},
            {"name": "Creatinine", "value": 1.6, "unit": "mg/dL", "status": "high", "reference_range": "0.6 - 1.2", "organ": "kidneys", "description": "Waste product filtered by kidneys."},
            {"name": "ALT Enzyme", "value": 22.0, "unit": "U/L", "status": "normal", "reference_range": "10 - 40", "organ": "liver", "description": "Liver enzyme indicating processing strain."},
            {"name": "Vitamin D3", "value": 35.0, "unit": "ng/mL", "status": "normal", "reference_range": "30 - 100", "organ": "bones", "description": "Supports calcium absorption and bone density."},
            {"name": "Fasting Glucose", "value": 88.0, "unit": "mg/dL", "status": "normal", "reference_range": "70 - 99", "organ": "pancreas", "description": "Primary monosaccharide fueling cells."}
        ]
    else:
        # Fallback combination
        return [
            {"name": "Vitamin D3", "value": 18.0, "unit": "ng/mL", "status": "low", "reference_range": "30 - 100", "organ": "bones", "description": "Supports calcium absorption and bone density."},
            {"name": "ALT Enzyme", "value": 52.0, "unit": "U/L", "status": "high", "reference_range": "10 - 40", "organ": "liver", "description": "Liver enzyme indicating processing strain."},
            {"name": "Hemoglobin", "value": 14.8, "unit": "g/dL", "status": "normal", "reference_range": "13.5 - 17.5", "organ": "heart", "description": "Oxygen-carrying protein in red blood cells."},
            {"name": "Creatinine", "value": 0.9, "unit": "mg/dL", "status": "normal", "reference_range": "0.6 - 1.2", "organ": "kidneys", "description": "Waste product filtered by kidneys."}
        ]
