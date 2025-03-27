"use client";
import { useEffect, useState } from "react";
import nlp from "compromise";
import Hero from "./components/hero";

interface FactCheckResponse {
  claims: {
    text: string;
    claimant?: string;
    claimReview: {
      publisher: { name: string; site: string };
      textualRating: string;
      url: string;
    }[];
  }[];
}

const VeriFactAI: React.FC = () => {
  const [userNews, setuserNews] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ status: string; info: string } | null>(
    null
  );
  const [maxNewsPrediction, setMaxNewsPrediction] = useState<number | null>(
    null
  );
  const [googleApiCheck, setGoogleApiCheck] = useState<boolean>(true);
  const [newsApiCheck, setNewsApiCheck] = useState<boolean>(true);
  const [processStarted, setProcessStarted] = useState<boolean>(false);

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FACT_CHECK_API_KEY;

  const getTheApisData = () => {
    if (userNews == "") return;
    setProcessStarted(true);
    setLoading(true);
    fetchGoogleApiData(userNews);
    const doc = nlp(userNews);
    const nouns = doc.nouns().out("array").join(" "); // Convert array to string
    fetchNewsApiData(nouns);
  };

  async function fetchGoogleApiData(query: string): Promise<void> {
    if (userNews === "") return;
    if (!API_KEY) {
      console.error("Missing API key.");
      return;
    }

    setLoading(true);
    setResult(null); // Reset previous result

    const API_URL = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(
      query
    )}&key=${API_KEY}`;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: FactCheckResponse = await response.json();

      if (!data.claims || data.claims.length === 0) {
        console.log("No fact-checking results found.");
        setGoogleApiCheck(false);
        setResult({ status: "⚠️", info: "No claims found for this news." });
        return;
      }

      const allClaims = data.claims.map(
        (claim, index) => `Claim ${index + 1}: ${claim.text}`
      );
      if (allClaims.length === 0) {
        setResult({ status: "⚠️", info: "No claims found." });
      } else {
        setResult({ status: "✅", info: "Claims retrieved successfully." });
        setGoogleApiCheck(true);
        checkSimilarity(allClaims);
      }
    } catch (error) {
      console.error("Error fetching fact-check data:", error);
      setResult({
        status: "⚠️",
        info: "Error fetching data. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchNewsApiData(query: string) {
    const API_KEY = "f6b415a7a7344861bccea1916fea14fa";
    const URL = `https://newsapi.org/v2/everything?qInTitle=${encodeURIComponent(
      query
    )}&sortBy=relevancy&language=en&apiKey=${API_KEY}`;

    try {
      const response = await fetch(URL);
      const data = await response.json();

      if (data.articles.length > 0) {
        setNewsApiCheck(true);
        checkSimilarity(data.articles.map((article: any) => article.title));
      } else {
        setNewsApiCheck(false);
        console.log("No highly relevant news found for:", query);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }

  async function checkSimilarity(apiNews: string[]) {
    console.log(apiNews);

    if (!apiNews.length) {
      console.error("No claims to compare.");
      return;
    }

    const BACKEND_URL = "http://127.0.0.1:8000/similarity";
    let similarityScores: number[] = [];

    try {
      for (const news of apiNews) {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text1: userNews.trim(), // User-entered news
            text2: news.trim(), // Claim from fact-check API
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const score = parseFloat(data.similarity_score); // Convert to float
        if (!isNaN(score)) {
          similarityScores.push(score);
        }
      }

      // Find the max similarity score
      if (similarityScores.length > 0) {
        const maxSimilarity = Math.max(...similarityScores);
        setLoading(false);
        setMaxNewsPrediction((prev) => Math.max(prev ?? 0, maxSimilarity));

        console.log("Maximum Similarity Score:", maxSimilarity);
      } else {
        console.log("No valid similarity scores found.");
      }
    } catch (error) {
      console.error("Error sending similarity request:", error);
    }
  }

  return (
    <div>
        <Hero />
    </div>
  );
};

export default VeriFactAI;
