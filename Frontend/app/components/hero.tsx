"use client";
import { useEffect, useRef, useState } from "react";
import nlp from "compromise";
// import GlobeBackground, { WorldMap } from "./globe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from "react-dropzone";
import { RxText } from "react-icons/rx";
import { FaRegImage } from "react-icons/fa6";
import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.globe.min";
import { motion } from "framer-motion";


interface ClaimReview {
  publisher: {
    name: string;
    site: string;
  };
  textualRating: string;
  url: string;
}

interface Claim {
  text: string;
  claimant?: string;
  claimReview: ClaimReview[];
}

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
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    
    size: 1.50,
    backgroundColor: 0xffffff
          })
        );
      }
      return () => {
        if (vantaEffect) vantaEffect.destroy();
      };
    }, [vantaEffect]);
  
    return <div ref={bgRef} className="absolute inset-0 w-full h-full z-[-1]" />;
  };
  
  

const Hero: React.FC = () => {

    return (
        <div className="relative w-full h-screen flex flex-col justify-center items-center">
        {/* Globe Background */}
        < GlobeBackground/>
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
            <span className="font-semibold text-black"> genuine or fabricated.</span>
          </p>
    
          {/* Input Field */}
          <textarea
            className="w-full h-32 p-4 text-lg bg-transparent text-gray-900 backdrop-blur-sm border  rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 placeholder-gray-500 resize-none"
            placeholder="Enter news article headline..."
          ></textarea>
    
          {/* Button */}
          <button
            className="mt-4 w-full py-3 bg-black hover:bg-gray-800 transition-all rounded-lg text-lg font-semibold text-white shadow-md"
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
    
      </div>
      
      );
    

//   return (
//     <div className="w-full flex flex-col relative bg-transparent z-[-1] text-white">
//       {/* Main Content */}
//       <div className="w-full relative flex-center flex-col z-10 bg-transparent">
//         <div className="w-full flex-center flex-col border-2 py-14 border-white rounded-2xl ">
//           {/* Top Section */}
//           <div className="w-full flex flex-col justify-center items-center p-8 mt-16">
//             <WorldMap />
//             <h1
//               className="text-5xl font-extrabold text-center text-gray-600 mt-8"
//               //   initial={{ y: -20, opacity: 0 }}
//               //   animate={{ y: 0, opacity: 1 }}
//               //   transition={{ duration: 0.5 }}
//             >
//               VeriFact AI - News Verification
//             </h1>
//             <p className="text-md text-center text-gray-700">
//               Input a news headline, and our determine if it's{" "}
//               <strong>genuine or fabricated</strong>
//             </p>
//           </div>

//           {/* Left Section */}
//           <div className="w-full flex flex-col justify-center items-center p-8 rounded-lg m-4">
//           <Tabs defaultValue="account" className="">
//       <TabsList className="grid w-[200px] grid-cols-2 text-xl">
//         <TabsTrigger value="account"><RxText /></TabsTrigger>
//         <TabsTrigger value="password"><FaRegImage /></TabsTrigger>
//       </TabsList>

//       <TabsContent value="account">
//         <textarea
//           className="w-[1000px] p-4 rounded-lg border focus:outline-none text-lg text-black placeholder-gray-500"
//           rows={5}
//           placeholder="Enter news article headline..."
//           value={userNews}
//           onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
//             setUserNews(e.target.value)
//           }
//         />
//       </TabsContent>

//       <TabsContent value="password">
//         <div
//           {...getRootProps()}
//           className="w-[1000px] h-[200px] p-8 border-2 border-dashed rounded-lg flex justify-center items-center text-center cursor-pointer"
//         >
//           <input {...getInputProps()} />
//           {imagePreview ? (
//             <img
//               src={imagePreview}
//               alt="Preview"
//               className="max-w-full max-h-64 object-contain"
//             />
//           ) : (
//             <p className="text-gray-500">Drag and drop an image here, or click to select a file</p>
//           )}
//         </div>
//       </TabsContent>
//     </Tabs>

//             <button
//               onClick={getTheApisData}
//               className="mt-6 w-full py-3 bg-black hover:bg-gray-900 transition rounded-lg text-lg font-semibold shadow-md text-white"
//               disabled={loading}
//             >
//               {loading ? "Analyzing..." : "Verify News"}
//             </button>
//           </div>
//         </div>

//         <div className="mt-8">
//           {processStarted &&
//             (loading ? (
//               <div className="text-center text-gray-700">loading...</div>
//             ) : (
//               <div>
//                 {(googleApiCheck || newsApiCheck) && maxNewsPrediction ? (
//                   <div>
//                     <div
//                       className={`p-6 rounded-lg text-white text-center shadow-lg transition-all ${
//                         maxNewsPrediction > 0.7
//                           ? "bg-gradient-to-r from-green-500 to-green-700"
//                           : maxNewsPrediction >= 0.5
//                           ? "bg-gradient-to-r from-yellow-500 to-yellow-700"
//                           : "bg-gradient-to-r from-red-600 to-red-800"
//                       }`}
//                     >
//                       <div className="flex items-center justify-center mb-3">
//                         {maxNewsPrediction > 0.7 ? (
//                           <div className="flex items-center space-x-2">
//                             <span className="text-4xl">✅</span>
//                             <h3 className="text-3xl font-bold">
//                               News Verified!
//                             </h3>
//                           </div>
//                         ) : maxNewsPrediction >= 0.5 ? (
//                           <div className="flex items-center space-x-2">
//                             <span className="text-4xl">⚠️</span>
//                             <h3 className="text-3xl font-bold">
//                               Uncertain News!
//                             </h3>
//                           </div>
//                         ) : (
//                           <div className="flex items-center space-x-2">
//                             <span className="text-4xl">🚨</span>
//                             <h3 className="text-3xl font-bold">
//                               Fake News Alert!
//                             </h3>
//                           </div>
//                         )}
//                       </div>

//                       <p className="text-lg">
//                         {maxNewsPrediction > 0.7 ? (
//                           <>
//                             ✅ According to our model, there is a{" "}
//                             <span className="font-semibold">
//                               {(maxNewsPrediction * 100).toFixed(2)}% chance
//                             </span>{" "}
//                             that this news is **TRUE**.
//                           </>
//                         ) : maxNewsPrediction >= 0.5 ? (
//                           <>
//                             ⚠️ This news has a{" "}
//                             <span className="font-semibold text-gray-900">
//                               {(maxNewsPrediction * 100).toFixed(2)}%
//                               probability
//                             </span>{" "}
//                             of being true, but we recommend **checking other
//                             sources** before trusting it.
//                           </>
//                         ) : (
//                           <>
//                             🚨 Our model predicts a{" "}
//                             <span className="font-semibold text-yellow-300">
//                               {((1 - maxNewsPrediction) * 100).toFixed(2)}%
//                               chance
//                             </span>{" "}
//                             that this news is **FAKE**. Be cautious before
//                             sharing!
//                           </>
//                         )}
//                       </p>

//                       {/* Buttons */}
//                       {maxNewsPrediction > 0.7 ? (
//                         <button className="mt-4 bg-white text-green-700 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
//                           ✅ Share the Truth
//                         </button>
//                       ) : maxNewsPrediction >= 0.5 ? (
//                         <button className="mt-4 bg-white text-yellow-800 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
//                           ⚠️ Read More from Trusted Sources
//                         </button>
//                       ) : (
//                         <button className="mt-4 bg-white text-red-700 px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
//                           🚨 Report Misinformation
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center p-6 bg-gray-200 text-black rounded-lg shadow-lg">
//                     <span className="text-5xl mb-3">🤔</span>
//                     <h3 className="text-2xl font-bold text-gray-800">
//                       No Data Found
//                     </h3>
//                     <p className="text-lg text-gray-600 text-center mt-2">
//                       The news might be{" "}
//                       <strong className="text-red-500">fake</strong>. Please
//                       verify with other sources before trusting it.
//                     </p>
//                     <button className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md font-semibold transition">
//                       🔎 Verify Sources
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))}
//         </div>
//       </div>
//     </div>
//   );


};

export default Hero;
