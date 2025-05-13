import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Corrected import: Changed LoaderCircle to Loader2
import { Heart, Loader2, AlertTriangle } from 'lucide-react';

// Define the backend API URL
// Make sure this matches the port your backend is running on!
const API_URL = '/api/generate-message';
//const API_URL = 'http://localhost:3001/api/generate-message';

const InspirationalLoveApp = () => {
  // --- !!! IMPORTANT: UPDATE THIS START DATE !!! ---
  // Change this string to the actual start date of the relationship
  // Format: YYYY-MM-DD
  const startDate = new Date('2025-05-10');
  // --- !!! END IMPORTANT !!! ---

  const [daysTogether, setDaysTogether] = useState(null); // Initialize as null
  const [currentDate, setCurrentDate] = useState('');

  // State for the inspirational text and API call status
  const [inspirationalText, setInspirationalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect for calculating days and date
  useEffect(() => {
    const calculateDates = () => {
      const today = new Date();
      // Ensure time portion is zeroed out for accurate day difference calculation
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0,0,0,0);

      const difference = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      setDaysTogether(difference);

      const options = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      };
      // Use current date formatting based on locale
      setCurrentDate(today.toLocaleDateString(undefined, options));
    };

    calculateDates(); // Initial calculation
    // Set interval to check roughly daily (or adjust frequency as needed)
    const interval = setInterval(calculateDates, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [startDate]); // Re-run if startDate changes (though it's constant here)

  // Effect for fetching the message from the backend when daysTogether changes
  useEffect(() => {
    // Don't fetch if daysTogether hasn't been calculated yet
    if (daysTogether === null) {
        setInspirationalText(""); // Show nothing initially
        return;
    }

    const fetchMessage = async () => {
      setIsLoading(true);
      setError(null);
      setInspirationalText(''); // Clear previous text while loading

      try {
        // Fetch message from the backend, passing days as a query parameter
        const response = await fetch(`${API_URL}?days=${daysTogether}`);

        if (!response.ok) {
          // Try to parse error from backend response body
          let errorMsg = `Network response was not ok (Status: ${response.status})`;
          try {
              const errorData = await response.json();
              errorMsg = errorData.error || errorMsg; // Use backend error if available
          } catch (parseError) {
              // Ignore if response isn't JSON
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();

        if (data.message) {
          setInspirationalText(data.message);
        } else if (data.error) { // Handle errors sent in JSON response body
            throw new Error(data.error);
        }
         else {
          // Handle case where backend might send success but no message/error
          throw new Error("Received empty response from backend");
        }

      } catch (err) {
        console.error("Failed to fetch message:", err);
        setError(err.message || "Failed to load message. Please try again later.");
        setInspirationalText(''); // Clear text on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
    // Dependency array: re-fetch when daysTogether changes
  }, [daysTogether]);

  // Render the component
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4 text-white font-sans">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        className="text-center space-y-5 max-w-2xl mx-auto"
      >
        {/* Days Together - Handle null state */}
        <motion.p
          key={`days-${daysTogether}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide"
        >
          <span className="text-pink-400">{daysTogether !== null ? Math.max(0, daysTogether) : '-'}</span> Days of Togetherness
        </motion.p>

        {/* Current Date */}
        <motion.p
          key={`date-${currentDate}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-300"
        >
          {currentDate || 'Loading date...'} {/* Show placeholder if date not ready */}
        </motion.p>

        {/* Inspirational Text Area */}
        <motion.div
          key={`text-status-${isLoading}-${error}-${daysTogether}`}
          initial={{ opacity: 0, height: 'auto' }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-md sm:text-lg italic text-gray-100 min-h-[60px] flex items-center justify-center p-3 bg-white/5 rounded-lg shadow-md"
        >
          {isLoading && (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              {/* Corrected usage: Changed LoaderCircle to Loader2 */}
              <Loader2 className="w-6 h-6 text-pink-400" />
            </motion.div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm sm:text-base text-left">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {!isLoading && !error && inspirationalText && (
            <p className="text-center">{inspirationalText}</p>
          )}
           {!isLoading && !error && !inspirationalText && daysTogether !== null && (
             <p className="text-gray-400">Awaiting today's message...</p> // Placeholder
           )}
           {/* Handle case where days are negative explicitly if desired */}
           {!isLoading && !error && !inspirationalText && daysTogether !== null && daysTogether < 0 && (
             <p className="text-gray-400">Waiting for our journey to begin...</p>
           )}
        </motion.div>

        {/* Closing Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.6 }}
          className="text-xl sm:text-2xl font-semibold text-pink-300 flex items-center justify-center gap-2 mt-6"
        >
          With love,
          <Heart className="w-6 h-6 fill-pink-400 text-pink-400" />
          Aryu
        </motion.p>
      </motion.div>
    </div>
  );
};

export default InspirationalLoveApp;