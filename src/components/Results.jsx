import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchResults } from "../hooks/useFetchResults";

const Results = () => {
  const { data, loading, error, fetchData } = useFetchResults();
  const [selectedConstituency, setSelectedConstituency] = useState("all");

  const constituencyRef = useRef("all");

  const constituencies = {
    all: "all",
    constituency1: "Constituency A",
    constituency2: "Constituency B",
    constituency3: "Constituency C",
    constituency4: "Constituency D",
    constituency5: "Constituency E",
  };

  const fetchHelper = async () => {
    if (constituencyRef.current === "all") {
      fetchData(`${import.meta.env.VITE_SERVER_URI}/api/results/parties`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
    } else {
      fetchData(`${import.meta.env.VITE_SERVER_URI}/api/results/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: constituencyRef.current }),
      });
    }
  };

  useEffect(() => {
    constituencyRef.current = selectedConstituency;
    fetchHelper();
  }, [selectedConstituency]);

  useEffect(() => {
    const wss = new WebSocket(import.meta.env.VITE_SOCKET_URL);
    console.log("log",import.meta.env.VITE_SOCKET_URL)

    wss.onopen = () => {
      wss.send("Init");
    };

    wss.onmessage = (message) => {
      if (message.data.toString() === "Voted") {
        fetchHelper();
      }
    };

    return () => {
      wss.close();
    };
  }, []);

  return (
    <>
      <div className="p-4">
        <label
          htmlFor="constituency"
          className="block text-sm font-medium text-white mb-2"
        >
          Select Constituency:
        </label>
        <select
          id="constituency"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={selectedConstituency}
          onChange={(e) => setSelectedConstituency(e.target.value)}
        >
          {Object.values(constituencies).map((constituencyName) => (
            <option key={constituencyName} value={constituencyName}>
              {constituencyName}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4">
        {loading && <p className="col-span-4 text-center">Loading...</p>}
        {error && <p className="col-span-4 text-center text-black-500">{error}</p>}
        {!loading && !error && data.length > 0 ? (
          data.map((item, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>
                  {item.name || item.voterDetails || "Party: " + item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.voteCount}</CardDescription>
              </CardContent>
            </Card>
          ))
        ) : (
          !loading && !error && (
            <p className="col-span-4 text-center">No data available</p>
          )
        )}
      </div>
    </>
  );
};

export default Results;
