import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useFetchCandidates from "@/hooks/useFetchCandidates";
import useCastVote from "@/hooks/useCastVote";

export default function VotingPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const Socket = useRef();

  if (!token) {
    navigate("/login"); 
  }

  const { candidates, error, loading: loadingCandidates, details, constituency } = useFetchCandidates(token);
  const { castVote, errorMessage, loading: loadingVote } = useCastVote(token);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; 
    const wss = new WebSocket(SOCKET_URL);
    Socket.current = wss;

    wss.onopen = () => {
      wss.send("Init");
    };

    wss.onmessage = (message) => {
      if (message.data.toString() === "Done") {
        navigate("/");
      }
    };

    wss.onerror = (error) => {
      console.error("WebSocket Error: ", error);
    };

    return () => {
      wss.close();
    };
  }, [navigate]);

  const handleVoteClick = (candidate) => {
    setSelectedCandidate(candidate);
    setShowWarning(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) {
      alert("No candidate selected. Please select a candidate before confirming.");
      return;
    }

    const status = await castVote(selectedCandidate.candidateID);

    if (status) {
      setShowWarning(false);
      if (Socket.current && Socket.current.readyState === WebSocket.OPEN) {
        Socket.current.send("Vote");
      }
    } else {
      alert(errorMessage || "Failed to cast your vote. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">Voter Details</h2>
          <p><strong>Voter Name:</strong> {details?.name || 'N/A'}</p>
          <p><strong>Voter ID:</strong> {details?.Id || 'N/A'}</p>
          <p><strong>Constituency:</strong> {constituency || 'N/A'}</p>
        </div>
        <div className="mt-5">
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {loadingCandidates ? (
        <div>Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div>No candidates available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.candidateID} className="shadow-md">
              <CardHeader>
                <CardTitle>{candidate.name}</CardTitle>
                <CardDescription>{candidate.party_name}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Button variant="primary" onClick={() => handleVoteClick(candidate)}>
                  Vote
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}

      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-black text-lg mb-4">
              Are you sure you want to vote for <strong>{selectedCandidate?.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={() => setShowWarning(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmVote} disabled={loadingVote}>
                {loadingVote ? "Casting Vote..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
