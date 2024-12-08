import { useState, useEffect } from "react";

const useFetchCandidates = (token) => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState();
  const [constituency, setConstituency] = useState();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true); 
      try {
        console.log('TOKEN:', token);
        const response = await fetch("http://localhost:8000/api/voter/fetch", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "token": token
          },
        });
        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to fetch candidates.");
        }

        const data = await response.json();
        
        setCandidates(data.result || []);
        setDetails({name: data.details.name, Id: data.details.voterId} || "");
        setConstituency(data.constituency || "");
      } catch (err) {
        setError(err.message || "An error occurred while fetching candidates.");
      } finally {
        setLoading(false); 
      }
    };

    if (token) {
      fetchCandidates();
    }
  }, [token]);

  return { candidates, error, loading, details, constituency};
};

export default useFetchCandidates;
