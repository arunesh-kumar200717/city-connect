export const COMPLAINT_CATEGORIES: Record<string, string[]> = {
  "Infrastructure": [
    "Street light issue",
    "Potholes / Road damage",
    "Broken footpath",
    "Bridge damage",
    "Fallen tree",
  ],
  "Water": [
    "Water leakage",
    "No water supply",
    "Low pressure",
    "Drainage issue",
    "Contamination",
  ],
  "Waste Management": [
    "Garbage not collected",
    "Overflowing bins",
    "Illegal dumping",
  ],
  "Electricity": [
    "Power outage",
    "Transformer issue",
    "Wire damage",
  ],
  "Public Safety": [
    "Open manhole",
    "Illegal parking",
    "CCTV not working",
  ],
  "Environment": [
    "Tree cutting",
    "Pollution issue",
  ],
  "Public Services": [
    "Tax issue",
    "Government service delay",
  ],
};

export const CITIES: Record<string, string[]> = {
  "Mumbai": ["Andheri", "Bandra", "Colaba", "Dadar", "Goregaon", "Juhu", "Kandivali", "Malad"],
  "Delhi": ["Connaught Place", "Dwarka", "Karol Bagh", "Lajpat Nagar", "Rohini", "Saket"],
  "Bangalore": ["Indiranagar", "Koramangala", "Whitefield", "Electronic City", "Jayanagar", "HSR Layout"],
  "Chennai": ["Adyar", "Anna Nagar", "T. Nagar", "Velachery", "Mylapore", "Guindy"],
  "Hyderabad": ["Banjara Hills", "Gachibowli", "HITEC City", "Jubilee Hills", "Madhapur"],
};

export const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Rejected",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
