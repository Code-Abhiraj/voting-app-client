import { useState } from "react";

export const useVotersData = () => {
  const [isVoterLoading, setIsVoterLoading] = useState(false);
  const [voterError, setVoterError] = useState(null);

  const fetchVoterData = async (voterId) => {
    setIsVoterLoading(true);
    setVoterError(null);

    try {
      const response = await fetch("http://localhost:8000/api/voter/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voterId }),
      });

      if (response.status === 401) {
        setVoterError("Voter has already voted");
        setIsVoterLoading(false);
        return null;
      }

      if (response.status === 404) {
        setVoterError("Voter ID not found");
        setIsVoterLoading(false);
        return null;
      }

      if (response.status === 409) {
        setVoterError("Voter has already voted");
        setIsVoterLoading(false);
        return null;
      }

      if (response.status === 500) {
        setVoterError("Internal Server Error");
        
        setIsVoterLoading(false);
        return null;
      }

      const data = await response.json();
      console.log('Data:', data);
      setIsVoterLoading(false);
      return data;
    } catch (err) {
      setVoterError("Network Error");
      setIsVoterLoading(false);
      return null;
    }
  };

  return { fetchVoterData, isVoterLoading, voterError };
};
