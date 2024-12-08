import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOfficersData } from "../hooks/useOfficersData";
import { useVotersData } from "../hooks/useVotersData";
import Results from "../components/Results";

export default function IndexPage() {
  const navigate = useNavigate();
  
  const [voterID, setVoterID] = useState("");
  const [officerID, setOfficerID] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpDialog, setShowOtpDialog] = useState(false);  
  const { fetchOfficerData, isOfficerLoading, officerError } = useOfficersData();
  const { fetchVoterData, isVoterLoading, voterError } = useVotersData();

  const handleVoterIDSubmit = async (event) => {
    event.preventDefault();
    const value = await fetchVoterData(voterID);
    console.log(value);
  
    if (value) {
      alert("Voter Verified");
      setShowOtpDialog(true); // Show OTP dialog
    } else {
      console.log(voterError);
    }
  };
  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/voter/otp", {
      method: "POST",
      body: JSON.stringify({ voterId: voterID, otp }),
      headers: { "Content-Type": "application/json" },
    });
  
    const result = await response.json();
    if (response.ok) {
      localStorage.setItem("token", result.token);
      alert("OTP Verified. Redirecting to Voting Page.");
      navigate(`/VotingPage`);
    } else {
      alert(result.message);
    }
  };
  const handleOfficerIDSubmit = async (event) => {
    event.preventDefault();
    const value = await fetchOfficerData(officerID);
    setOfficerID("");

    if (value && value.token) {
      localStorage.setItem("token", value.token);
      alert('Officer Verified');
      navigate(`/Officer`);
    } else {
      alert(officerError);
    }
  };

 

  return (
    <>
      <div className="grid grid-cols-2 h-50vh text-justify">
        <div>
          <Results />
        </div>
        <div className="flex justify-center items-center">
          <Tabs
            defaultValue="account"
            className="w-[400px] bg-slate shadow-md rounded-md border border-gray-200 p-4"
          >
            <TabsList className="flex gap-2 border-b border-gray-300 mb-4">
              <TabsTrigger
                value="account"
                className="px-4 py-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                Voter
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="px-4 py-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                Officer
              </TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="text-gray-700">
              <label
                htmlFor="voterID"
                className="block text-sm font-medium text-white mb-2"
              >
                Enter your Voter ID
              </label>
              <input
                id="voterID"
                type="text"
                placeholder="Enter Voter ID"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={voterID}
                onChange={(e) => setVoterID(e.target.value)}
              />
              {!isVoterLoading ? (
                <button
                  onClick={handleVoterIDSubmit}
                  disabled={isOfficerLoading}
                  className={`mt-4 px-4 py-2 text-white rounded-md ${
                    isOfficerLoading ? "bg-gray-400" : "bg-blue-600"
                  }`}
                >
                  Submit Voter ID
                </button>
              ) : (
                <>Loading....</>
              )}
              {voterError && <p className="mt-2 text-red-400">{voterError}</p>}
            </TabsContent>
            <TabsContent value="password" className="text-gray-700">
              <label
                htmlFor="officerID"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Enter your Officer ID
              </label>
              <input
                id="officerID"
                type="text"
                placeholder="Enter Officer ID"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={officerID}
                onChange={(e) => setOfficerID(e.target.value)}
              />
              {!isOfficerLoading ? (
                <button
                  onClick={handleOfficerIDSubmit}
                  disabled={isOfficerLoading}
                  className={`mt-4 px-4 py-2 text-white rounded-md ${
                    isOfficerLoading ? "bg-gray-400" : "bg-blue-600"
                  }`}
                >
                  Submit Officer ID
                </button>
              ) : (
                <>Loading....</>
              )}
              {officerError && <p className="mt-2 text-black-500">{officerError}</p>}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* OTP Dialog Box */}
      {showOtpDialog && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-md shadow-md">
      <h3>Enter OTP</h3>
      <input
        type="text"
        placeholder="Enter OTP"
        className="border p-2 mb-4"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button
        onClick={handleOtpSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Submit OTP
      </button>
    </div>
  </div>
)}
    </>
  );
}
