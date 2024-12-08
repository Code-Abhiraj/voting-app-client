import { useState } from "react";

export const useOfficersData = () => {
  const [isOfficerLoading, setIsOfficerLoading] = useState(false);
  const [officerError, setOfficerError] = useState(null);

  const fetchOfficerData = async (officerId) => {
    setIsOfficerLoading(true);
    setOfficerError(null);

    try {
      const response = await fetch("http://localhost:8000/api/officer/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ officerId }),
      });

      if (response.status === 404) {
        setOfficerError("Invalid Officer ID");
        setIsOfficerLoading(false);
        return null;
      }

      if (response.status === 500) {
        setOfficerError("Internal Server Error");
        setIsOfficerLoading(false);
        return null;
      }

      const data = await response.json();
      setIsOfficerLoading(false);
      return data;
    } catch (err) {
      setOfficerError("Network Error");
      setIsOfficerLoading(false);
      return null;
    }
  };

  return { fetchOfficerData, isOfficerLoading, officerError };
};
