from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import re
import requests
from bs4 import BeautifulSoup

app = FastAPI()

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
with open('fake_job_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

class JobInput(BaseModel):
    url: str
    manual_text: str = ""

def get_risk_score(text):
    vec = vectorizer.transform([text])
    prob = model.predict_proba(vec)[:, 1][0]
    return round(float(prob * 100), 2)

def get_url_risk_score(url):
    score = 0
    if any(url.endswith(tld) for tld in ['.tk', '.ml', '.ga', '.cf', '.xyz']):
        score += 40
    if any(w in url.lower() for w in ['free', 'earn', 'work-from-home', 'guaranteed', 'instant', 'urgent']):
        score += 25
    if not url.startswith('https'):
        score += 15
    if url.count('-') >= 3:
        score += 10
    if len(re.findall(r'\d', url)) >= 3:
        score += 10
    return min(score, 100)

def scrape_job(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
        return text[:1000] if len(text) > 100 else None
    except:
        return None

@app.post("/analyze")
def analyze(job: JobInput):
    scraped = scrape_job(job.url)
    
    if scraped:
        text = scraped
        source = "auto"
    elif job.manual_text:
        text = job.manual_text
        source = "manual"
    else:
        return {"error": "Could not scrape. Please paste description manually."}
    
    text_score = get_risk_score(text)
    url_score = get_url_risk_score(job.url)
    final_score = round((text_score * 0.7) + (url_score * 0.3), 2)
    
    if final_score >= 40:
        label = "HIGH RISK"
        color = "red"
    elif final_score >= 20:
        label = "MEDIUM RISK"
        color = "orange"
    else:
        label = "LOW RISK"
        color = "green"
    
    return {
        "text_score": text_score,
        "url_score": url_score,
        "final_score": final_score,
        "label": label,
        "color": color,
        "source": source
    }

@app.get("/")
def root():
    return {"message": "Fake Internship Detector API is running!"}