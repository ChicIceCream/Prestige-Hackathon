import os
import json
import requests
import numpy as np
import nltk
from io import BytesIO
from urllib.parse import urlparse
from newspaper import Article
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from phi.agent import Agent
from phi.model.groq import Groq
from phi.tools.duckduckgo import DuckDuckGo
from phi.tools import Toolkit
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import pipeline

# Load environment variables
load_dotenv()
GOOGLE_FACTCHECK_API_KEY = os.getenv("GOOGLE_FACTCHECK_API_KEY")

# Initialize NLP models
sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()
bert_sentiment = pipeline("sentiment-analysis")

def extract_article_text(url: str) -> str:
    """Extract the article text from a given URL using newspaper3k."""
    try:
        article = Article(url)
        article.download()
        article.parse()
        return article.text
    except Exception as e:
        print(f"Error extracting article text: {e}")
        return ""

def get_domain(url: str) -> str:
    """Extract the domain (source) from the URL."""
    parsed = urlparse(url)
    return parsed.netloc

def analyze_sentiment(text: str) -> str:
    """Performs sentiment analysis using VADER first and BERT if needed."""
    vader_result = sia.polarity_scores(text)
    compound_score = vader_result['compound']

    if compound_score >= 0.6:
        sentiment = "Highly Positive"
    elif compound_score <= -0.6:
        sentiment = "Highly Negative"
    else:
        sentiment = "Neutral"

    # If extreme sentiment is detected, use BERT for deeper analysis
    if sentiment in ["Highly Positive", "Highly Negative"]:
        bert_result = bert_sentiment(text)
        bert_label = bert_result[0]['label']
        confidence = round(bert_result[0]['score'] * 100, 2)
        return f"⚠️ **Sentiment Alert:** {bert_label} (Confidence: {confidence}%)"

    return f"✅ **Sentiment:** {sentiment}"

def query_factcheck_api(query: str, api_key: str = GOOGLE_FACTCHECK_API_KEY) -> list:
    """Query Google's Fact Check Tools API using the provided query."""
    endpoint = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {"query": query, "key": api_key, "pageSize": 5}
    try:
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        data = response.json()
        return [claim.get("claim", "") for claim in data.get("claims", [])]
    except requests.RequestException as e:
        print(f"Error querying Fact Check API: {e}")
        return []

def compute_similarity(text: str, candidate_texts: list) -> tuple:
    """Compute cosine similarity between text and candidate texts."""
    if not candidate_texts:
        return None, None
    try:
        embedding = sentence_model.encode([text])
        candidate_embeddings = sentence_model.encode(candidate_texts)
        sims = cosine_similarity(embedding, candidate_embeddings)[0]
        idx = int(sims.argmax())
        return float(sims[idx]), candidate_texts[idx]
    except Exception as e:
        print(f"Error computing similarity: {e}")
        return None, None

def fallback_web_search(query: str, duckduckgo_tool) -> list:
    """Use DuckDuckGo search for the query."""
    try:
        results = duckduckgo_tool.run(query)
        if isinstance(results, str):
            results = results.splitlines()
        return results[:5]
    except Exception as e:
        print(f"Error in web search: {e}")
        return []

def fallback_process_news(urls: list, current_article_text: str, max_results: int = 5) -> tuple:
    """Process fallback news URLs and compute similarity."""
    similarities = []
    excerpts = []
    for url in urls:
        try:
            news_text = extract_article_text(url)
            sim, _ = compute_similarity(current_article_text, [news_text])
            if sim is not None:
                similarities.append(sim)
                excerpt = news_text[:200].replace("\n", " ") + "..."
                excerpts.append(f"{url} -> {excerpt}")
        except Exception as e:
            print(f"Error processing fallback URL {url}: {e}")

    if similarities:
        idx = int(np.argmax(similarities))
        return similarities[idx], excerpts[idx]
    return None, None

class FactCheckToolkit(Toolkit):
    """A toolkit for fact-checking an article URL."""
    def fact_check(self, article_url: str) -> str:
        current_article_text = extract_article_text(article_url)
        if not current_article_text.strip():
            return "Error: No article text found."

        domain = get_domain(article_url)
        output = {"domain": domain}
        print(f"[FactCheckTool] Domain: {domain}")

        # Sentiment Analysis
        sentiment_result = analyze_sentiment(current_article_text)
        output["sentiment_analysis"] = sentiment_result

        # Fact Checking
        claims = query_factcheck_api(domain)
        if claims:
            print("[FactCheckTool] Found fact-check claims:")
            for idx, c in enumerate(claims, start=1):
                print(f"  {idx}. {c}")
            sim, best_claim = compute_similarity(current_article_text, claims)
            output["evidence_source"] = "Fact Check API claims"
            output["similarity"] = sim
            output["best_evidence"] = best_claim
        else:
            print("[FactCheckTool] No claims found. Falling back to web search...")
            duckduckgo_tool = DuckDuckGo()
            search_query = domain
            urls = fallback_web_search(search_query, duckduckgo_tool)

            if not urls:
                return "Error: No fallback news articles found."

            print("[FactCheckTool] Fallback news URLs retrieved:")
            for idx, url in enumerate(urls, start=1):
                print(f"  {idx}. {url}")

            sim, evidence_excerpt = fallback_process_news(urls, current_article_text)
            output["evidence_source"] = "Web search fallback"
            output["similarity"] = sim
            output["best_evidence"] = evidence_excerpt

        threshold = 0.8
        if output.get("similarity") is not None and output["similarity"] >= threshold:
            output["decision"] = "The article is supported by verified evidence."
        else:
            output["decision"] = "The article's claims are not strongly corroborated."

        return json.dumps(output, indent=4)

# Creating the AI agent
fact_check_toolkit = FactCheckToolkit()
fact_check_agent = Agent(
    name="FactCheck Agent",
    model=Groq(id="llama-3.3-70b-versatile"),
    tools=[fact_check_toolkit],
    instructions=["""
                Use the FactCheckTool to verify article claims and return similarity results.
                You should not use any previous information that you have. You are a blank model.
                Only when you look for sources and find information, that is what you will be 
                relating to. Your opinion does not matter in this manner. Thanks!
                This should be your format to return an answer:
                Your thoughts: (This is where you talk about whether the sources actually relate to prompt news.)
                DO NOT write too much. Write something very short and concise.
                List your claims like this:
                1. Claim 1 - your text and then link
                2. Claim 2 - your text and then link
                3. Claim 3 - your text and then link
                ----------------------------------------------------------
                Claims :(This is where you will tell your sources and how they affected
                your output with the similarity results between them and the prompt. This place should also include all the links as well next to the sources.)
                -----------------------------------------------------------
                Sentiment Analysis: Give the outcome of sentiment analysis.
                ------------------------------------------------------------
                Final Probability of the news being Real:
                Return final number based on similarity result. DO NOT show anything else in this section. Your output should only be a number with a percentage sign.
                """],
    show_tool_calls=True,
    markdown=True,
)
# from io import StringIO
# import sys


# if __name__ == "__main__":
#     test_url = "Aliens were found in Dholakpur, India"

#     # Capture the output of print_response
#     output_buffer = StringIO()
#     sys.stdout = output_buffer  # Redirect stdout to capture print output

#     fact_check_agent.print_response(test_url, stream=True)

#     sys.stdout = sys.__stdout__  # Reset stdout to normal
#     response = output_buffer.getvalue()  # Get the captured output

#     print("\n--- Final Response ---")
#     print(response)  # This prints the stored response
