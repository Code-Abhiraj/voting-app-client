import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const OfficersPage = () => {
  const [Data, setData] = useState({
    totalVoters: [],
    votedVoters: [],
    pendingVoters: [],
    candidates: [],
  });
  const [officerDetails, setOfficerDetails] = useState({});
  const [constituency, setConstituency] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const officerToken = localStorage.getItem('token');
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [dialogTitle, setDialogTitle] = useState('');

  if (!officerToken) {
    navigate('/login');
    return null;
  }

  const fetchData = async (endpoint) => {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': officerToken,
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching data from ${endpoint}`);
    }
    return await response.json();
  };

  const fetchAllData = async () => {
    try {
      const allVotersResponse = await fetchData('/api/officer/all');
      const votedVotersResponse = await fetchData('/api/officer/voted');
      const pendingVotersResponse = await fetchData('/api/officer/pending');
      const candidatesResponse = await fetchData('/api/officer/candidates');
      const officerResponse = await fetchData('/api/officer/details');

      setData({
        totalVoters: allVotersResponse.voters,
        votedVoters: votedVotersResponse.voters,
        pendingVoters: pendingVotersResponse.voters,
        candidates: candidatesResponse.candidates,
      });
      setOfficerDetails(officerResponse.details);
      setConstituency(officerResponse.constituency);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const openDialog = (title, data) => {
    setDialogTitle(title);
    setSelectedCategory(data);
  };

  useEffect(() => {
    fetchAllData();

    const wss = new WebSocket('ws://localhost:5001');

    wss.onopen = () => {
      wss.send('Init');
    };

    wss.onmessage = (message) => {
      if (message.data === 'Voted') {
        alert('New voter activity detected.');
        fetchAllData();
      }
    };

    return () => {
      wss.close();
    };
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="flex justify-between mb-6 p-4 border rounded-lg shadow">
        <div>
          <h2 className="text-lg font-bold">Officer Details</h2>
          <p><strong>Officer ID:</strong> {officerDetails.officerID || 'N/A'}</p>
          <p><strong>Constituency:</strong> {constituency || 'N/A'}</p>
        </div>
        <div className="mt-5">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Dialog>
          <DialogTrigger asChild>
            <Card
              onClick={() => openDialog('Total Voters', Data.totalVoters)}
              className="p-4 cursor-pointer hover:shadow-lg"
            >
              <h3 className="text-xl font-bold">Total Voters</h3>
              <p className="text-lg">{Data.totalVoters.length}</p>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-96">
              {selectedCategory.map((item, index) => (
                <div key={index} className="p-2 border-b">
                  <p><strong>ID:</strong> {item.voterId || item.candidateID}</p>
                  <p><strong>Name:</strong> {item.name}</p>
                  {item.voteCount !== undefined && <p><strong>Votes:</strong> {item.voteCount}</p>}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Card
              onClick={() => openDialog('Voted Voters', Data.votedVoters)}
              className="p-4 cursor-pointer hover:shadow-lg"
            >
              <h3 className="text-xl font-bold">Voted Voters</h3>
              <p className="text-lg">{Data.votedVoters.length}</p>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-96">
              {selectedCategory.map((item, index) => (
                <div key={index} className="p-2 border-b">
                  <p><strong>ID:</strong> {item.voterId}</p>
                  <p><strong>Name:</strong> {item.name}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Card
              onClick={() => openDialog('Pending Voters', Data.pendingVoters)}
              className="p-4 cursor-pointer hover:shadow-lg"
            >
              <h3 className="text-xl font-bold">Pending Voters</h3>
              <p className="text-lg">{Data.pendingVoters.length}</p>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-96">
              {selectedCategory.map((item, index) => (
                <div key={index} className="p-2 border-b">
                  <p><strong>ID:</strong> {item.voterId}</p>
                  <p><strong>Name:</strong> {item.name}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Card
              onClick={() => openDialog('Candidates', Data.candidates)}
              className="p-4 cursor-pointer hover:shadow-lg"
            >
              <h3 className="text-xl font-bold">Candidates</h3>
              <p className="text-lg">{Data.candidates.length}</p>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-96">
              {selectedCategory.map((item, index) => (
                <div key={index} className="p-2 border-b">
                  <p><strong>ID:</strong> {item.candidateID}</p>
                  <p><strong>Name:</strong> {item.name}</p>
                  <p><strong>Votes:</strong> {item.voteCount}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default OfficersPage;
