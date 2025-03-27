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
import { div } from "framer-motion/client";
import { LeftSection } from "./leftSection";
import CircularProgressBar from "./progress";
import ReactMarkdown from "react-markdown";
import ansiRegex from "ansi-regex";

interface ClaimReview {
  publisher: {
    name: string;
    site: string;
  };
  textualRating: string;
  url: string;
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

export function cleanAnsi(text: string) {
    return text.replace(ansiRegex(), "");
  }

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
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setExpanded(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/fact_check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok || !data.result) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data.result);
        setTimeout(() => setLoading(false), 1000);

        // Expand the page height
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    }
  };

  console.log("reulst", result);

  useEffect(() => {
    if (expanded) {
      window.scrollTo({
        top: resultRef.current.offsetTop + resultRef.current.offsetHeight,
        behavior: "smooth",
      });
      setTimeout(() => setLoading(true), 250);
    }
  }, [expanded]);

  useEffect(() => {
    if (result) {
      setCleanedResult(cleanAnsi(result)); // Remove ANSI codes
    }
  }, [result]);

  return (
    <div
      className={`transition-all duration-500 ${
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
                  className="w-full p-4 rounded-lg border focus:outline-none text-lg text-black placeholder-gray-500"
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
                  className="w-full h-[180px] p-8 border-2 border-dashed rounded-lg flex justify-center items-center text-center cursor-pointer overflow-hidden"
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
          <div ref={resultRef} className="w-full h-screen flex">
            {/* Left Section - Trusted Sources */}
            <div>
            {cleanedResult && <ReactMarkdown>{cleanedResult}</ReactMarkdown>}
            </div>

            {/* Right Section - News Verification Result */}
            <div className="w-1/2 bg-white h-full flex flex-col">
              <div
                className={`w-full h-1/2 flex-col p-16 justify-center items-center transition-all duration-500`}
              >
                <h1 className="text-white text-4xl font-bold mb-4">
                  {efficiency >= 50
                    ? "✅ Verified as Real News"
                    : "❌ Identified as Fake News"}
                </h1>
                <p className="text-white text-lg text-center max-w-lg">
                  Our advanced AI analysis has determined that this news has an
                  efficiency score of <strong>{efficiency}%</strong>. This means
                  we have analyzed multiple data points and detected that the
                  news is{" "}
                  {efficiency >= 50
                    ? "likely to be authentic."
                    : "highly suspicious and possibly false."}
                  Our system continuously improves its accuracy by evaluating
                  credibility factors from various trusted sources.
                </p>
              </div>

              {/* Bottom Right Section */}
              <div className="w-full h-1/2 bg-white flex justify-center items-center">
                <CircularProgressBar />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Hero;
