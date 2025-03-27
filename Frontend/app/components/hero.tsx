"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import nlp from "compromise";
// import GlobeBackground, { WorldMap } from "./globe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from "react-dropzone";
import { RxText } from "react-icons/rx";
import { FaRegImage } from "react-icons/fa6";
import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.globe.min";
import { motion } from "framer-motion";
import { div, li } from "framer-motion/client";
import { LeftSection } from "./leftSection";
import CircularProgressBar from "./progress";
import ReactMarkdown from "react-markdown";
import ansiRegex from "ansi-regex";
import stripAnsi from "strip-ansi";
import { FiLink } from "react-icons/fi";

export function parseApiResponse(raw: string) {
  // Remove ANSI escape sequences
  const withoutAnsi = raw.replace(/\x1B\[[0-9;]*[mK]/g, "");
  // Remove box-drawing characters (Unicode range U+2500 to U+257F)
  const cleaned = withoutAnsi.replace(/[\u2500-\u257F]/g, "").trim();

  // Helper function to match sections
  function matchSection(pattern: RegExp): string {
    const match = cleaned.match(pattern);
    return match ? match[1].trim() : "";
  }

  // 1. Extract "Your thoughts:" section
  const thought = matchSection(/Your thoughts:\s*(.*?)\s*(?:Claims|$)/s);

  // 2. Extract Claims as an array of strings
  const claims: { text: string; url: string }[] = [];
  const claimMatches = [
    ...cleaned.matchAll(
      /\d+\s*Claim\s*\d+\s*-\s*(.*?)\s*(https?:\/\/[^\s]+)/gs
    ),
  ];

  for (const match of claimMatches) {
    let text = match[1].replace(/\x1B\]8;id=\d+;/g, "").trim(); // Remove the "id=..." part
    let url = match[2].split("")[0].trim(); // Extract the clean URL before escape sequences

    claims.push({ text, url });
  }

  for (const match of claimMatches) {
    claims.push({
      text: match[1].trim(),
      url: match[2].trim(),
    });
  }
  for (const match of claimMatches) {
    claims.push(match[1].trim());
  }

  // 3. Extract Sentiment Analysis Outcome
  const sentiment = matchSection(
    /Sentiment Analysis\s*:(.*?)\s*(?:Final Probability|$)/s
  );

  // 4. Extract Final Probability (number)
  let finalProbability = 0;
  const finalProbMatch = cleaned.match(
    /Final Probability of the news being Real\s*[:\-]?\s*(\d+)%/i
  );
  if (finalProbMatch) {
    finalProbability = parseInt(finalProbMatch[1], 10);
  }

  return { thought, claims, sentiment, finalProbability };
}

const GlobeBackground = () => {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const bgRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        GLOBE({
          el: bgRef.current,
          THREE,
          mouseControls: true,
          color: 0x000000, // Black globe lines
          color2: 0x000000,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,

          size: 1.5,
          backgroundColor: 0xffffff,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={bgRef} className="absolute inset-0 w-full h-full z-[-1]" />;
};

const cleanText = (input: string) => {
  return input.replace(/\x1B\[[0-9;]*[mK]/g, "");
};

type claimType = {
  text: string;
  url: string;
};
type FinalDataType = {
  thought: string;
  claims: claimType[];
  sentiment: string;
  finalProbability: number;
};

const Hero: React.FC = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Stores image preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Stores selected file
  const [expanded, setExpanded] = useState(false);
  const resultRef = useRef(null);
  const [efficiency, setEfficiency] = useState<number>(0);
  const [cleanedResult, setCleanedResult] = useState("");
  const [finalData, setFinalData] = useState<FinalDataType>({
    thought: "",
    claims: [],
    sentiment: "",
    finalProbability: 0,
  });

  // Dropzone logic
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; // Get the first file
    if (file) {
      setSelectedFile(file);

      // Generate a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, // Accept only images
    multiple: false, // Allow only one file at a time
  });

  const handleFactCheck = async () => {
    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile); // `file` is the selected File object

      fetch("http://127.0.0.1:5000/fact_check", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => console.log("Upload success:", data))
        .catch((error) => console.error("Upload failed:", error));

      setSelectedFile(null);
      setUrl("");
      return;
    }

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setExpanded(true);
    setError(null);
    setResult(null);

    formData.append("text", url);

    try {
      const response = await fetch("http://127.0.0.1:5000/fact_check", {
        method: "POST",
        body: formData, // Send as FormData
      });

      const text = await response.json(); // Get plain text response

      if (!response.ok) {
        setError(text || "Something went wrong"); // Handle error
      } else {
        setResult(text.result);
        setTimeout(() => setLoading(false), 1000);
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    }
  };
  useEffect(() => {
    if (expanded && resultRef.current) {
      // Ensure `resultRef.current` is not null
      window.scrollTo({
        top: resultRef.current.offsetTop + resultRef.current.offsetHeight,
        behavior: "smooth",
      });

      setTimeout(() => {
        if (resultRef.current) {
          // Check again before modifying properties
          setLoading(true);
          resultRef.current.offsetTop = 0;
          resultRef.current.offsetHeight = 0;
        }
      }, 250);
    }
  }, [result]);

  useEffect(() => {
    if (result) {
      setCleanedResult(cleanText(result));
      setFinalData(parseApiResponse(result));
    }
  }, [result]);

  return (
    <div
      className={`transition-all duration-500 source-code-pro-quicksand ${
        expanded ? "min-h-[200vh]" : "min-h-screen"
      }`}
    >
      {/* Globe Background */}
      <GlobeBackground />
      <div className="relative w-full h-screen flex items-center justify-center px-6 ">
        {/* Container with 2 Sections: Left (Form) | Right (Globe) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-6xl items-center">
          {/* Left Side: Input Section */}
          <div className="w-full p-6">
            {/* Heading Section */}
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
              VeriFact AI - News Verification
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Input a news headline, and our AI will determine if it's
              <span className="font-semibold text-black">
                {" "}
                genuine or fabricated.
              </span>
            </p>

            {/* Input Field */}
            <Tabs defaultValue="account" className="">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="account" className="text-xl">
                  <RxText />
                </TabsTrigger>
                <TabsTrigger value="password" className="text-xl">
                  <FaRegImage />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <textarea
                  className="w-full p-4 rounded-lg border focus:outline-none bg-transparent backdrop-blur-sm text-lg text-black placeholder-gray-500"
                  rows={5}
                  placeholder="Enter news article headline..."
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setUrl(e.target.value)
                  }
                />
              </TabsContent>

              <TabsContent value="password">
                <div
                  {...getRootProps()}
                  className="w-full h-[180px] backdrop-blur-sm  p-8 border-2 border-dashed rounded-lg flex justify-center items-center text-center cursor-pointer overflow-hidden"
                >
                  <input {...getInputProps()} />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-gray-500">
                      Drag and drop an image here, or click to select a file
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Button */}
            <button
              className="mt-4 w-full py-3 bg-black hover:bg-gray-800 transition-all rounded-lg text-lg font-semibold text-white shadow-md"
              onClick={handleFactCheck}
            >
              Verify News
            </button>
          </div>

          {/* Right Side: Globe Background */}
          <div className="hidden lg:flex justify-center items-center">
            <GlobeBackground />
          </div>
        </div>
      </div>

      {expanded &&
        (loading ? (
          <div className="w-full min-h-screen fixed inset-0 flex items-center justify-center z-50">
            <img src="/research.gif" alt="Loading..." className="w-24 h-24" />
          </div>
        ) : (
          <div
            ref={resultRef}
            className="w-full h-full min-h-screen flex justify-center bg-gray-100 p-8 gap-6  flex-col md:flex-row"
          >
            {/* Left Section - Trusted Sources */}
            <div className="w-1/2 min-h-full bg-white shadow-xl rounded-lg p-6 duration-500  transform hover:scale-[1.01]">
              <h2 className="text-black text-2xl font-bold mb-4">
                Verified Sources
              </h2>

              {finalData.claims.length > 0 ? (
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <ul className="space-y-4">
                    {finalData.claims
                      .filter((_, index) => index < 3)
                      .map((claim, index) => (
                        <div className="bg-white shadow-md rounded-lg hover:bg-gray-200 p-4  transition">
                          <li className="">{claim.text}</li>

                          <a
                            href={claim.url}
                            className="text-blue-500 flex items-center gap-1"
                          >
                            {" "}
                            <span>
                              <FiLink />
                            </span>
                            Source
                          </a>
                        </div>
                      ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg shadow-md min-w-[200px] min-h-[300px] flex-center">
                  No Sources Available at the moment
                </div>
              )}

              {/* Sentiment Analysis Outcome */}
              <div className="mt-6 bg-gray-200 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">
                  Sentiment Analysis Outcome
                </h3>
                <p className="text-gray-700">{finalData.sentiment}</p>
              </div>
            </div>

            {/* Right Section - News Verification Result */}
            <div className="w-1/2 min-h-full flex flex-col gap-4 ">
              {/* Top Right Section */}
              <div
                className={`w-full h-1/2  mx-auto p-4 rounded-lg flex-center flex-col shadow-xl transition duration-300 transform hover:scale-[1.02] backdrop-blur-lg ${
                  finalData.finalProbability >= 50
                    ? "bg-green-100 border-l-8 border-green-500"
                    : "bg-red-100 border-l-8 border-red-500"
                }`}
              >
                <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">
                  News Verification Result
                </h2>

                <p className="text-gray-700 text-lg text-center max-w-xl mx-auto">
                  {finalData.thought}
                </p>

                {/* Verification Result */}
                <div
                  className={`flex-center w-[400px] mt-6 text-center font-bold text-2xl py-3 rounded-lg ${
                    finalData.finalProbability >= 50
                      ? "bg-green-600 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {finalData.finalProbability >= 50
                    ? "✅ Real News"
                    : "❌ Fake News"}
                </div>
              </div>

              {/* Bottom Right Section */}
              <div className="w-full h-1/2 bg-white flex flex-col justify-center items-center p-6 rounded-lg shadow-xl transition duration-500 hover:scale-[1.01] backdrop-blur-lg">
                {/* Progress Bar */}
                <div className="w-3/4">
                  <CircularProgressBar
                    efficiency={finalData.finalProbability}
                  />
                </div>

                {/* Probability Text */}
                <p className="mt-4 text-lg text-gray-700 text-center">
                  Based on the evidence from reputable sources and the lack of
                  emotional bias, the final probability of the news being
                  <span className="font-bold text-green-600">
                    {" "}
                    real{" "}
                  </span> is:{" "}
                  <span className="text-green-700 font-bold">
                    {finalData.finalProbability}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
 {!loading && (
  <div className="text-wrapper text-3xl text-black mb-4 opacity-60 uppercase h-16 flex items-end justify-end">
    {Array(8).fill("Half Baked Coders ✦").map((text, i) => (
      <span key={i} className="animated-text mr-2 tracking-wide">{text}</span>
    ))}
  </div>
)}



    </div>
  );
};

export default Hero;


