import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useApi } from "../hooks/useApi";
import Header from "../components/Header";
import { act } from "react";

export default function BuddyRequests() {
  const {getData,postData}=useApi()
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [activeTab, setActiveTab] = useState("incoming");

  
  // Fetch both incoming & outgoing requests
  const fetchRequests = async () => {
    try {
      const incomingRes = await getData("buddy/incoming/");
      const outgoingRes = await getData("buddy/outgoing/");
      console.log("Incoming ones...",incomingRes);
      console.log("Outgoing ones...",outgoingRes);
      setIncoming(incomingRes);
      setOutgoing(outgoingRes);
    } catch (err) {
      console.error("Error fetching buddy requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Accept or reject a buddy request
  const handleResponse = async (requestId, habitId, action) => {
    try {
      if(action==="rejected"){
        if(!confirm("Are you sure you want to reject the request?")) return ; 
      } 
      const res = await postData(`buddy/${habitId}/respond/`, { request_id: requestId, action:action });
      console.log("Here is the response to request;;;;;",res);
      fetchRequests();
     if(action==="accepted"){
         alert("Request accepted")
     }else if(action==="rejected"){
        alert("Request rejected")
     }
     else{
        alert("Something went wrong!")
     }
    
    } catch (err) {
      alert("An error occurred!")  
      console.error("Error responding to request:", err);
    }
  };

  return (
    <div className="p-6 pt-14 mt-7  dark:bg-gray-800 dark:text-white">
        <Header />
      <h1 className="text-2xl font-bold mb-6">Buddy Requests</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("incoming")}
          className={`pb-2 px-4 ${
            activeTab === "incoming"
              ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
              : "text-gray-500 dark:text-white"
          }`}
        >
          Incoming ({incoming.length})
        </button>
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`pb-2 px-4 ${
            activeTab === "outgoing"
              ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
              : "text-gray-500 dark:text-white"
          }`}
        >
          Outgoing ({outgoing.length})
        </button>
      </div>

      {/* Incoming Requests */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <p className="text-gray-500">No incoming requests.</p>
          ) : (
            incoming.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white  dark:bg-gray-700 shadow p-4 rounded-lg"
              >
                <div>
                  <p className="font-semibold dark:text-lime-400">{req.from_username}</p>
                  <p className="text-sm text-gray-500 dark:text-white">
                    Wants to join habit: {req.habit_title}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(req.id, req.habit_id, "accepted")}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleResponse(req.id, req.habit_id, "rejected")}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Outgoing Requests */}
      {activeTab === "outgoing" && (
        <div className="space-y-4">
          {outgoing.length === 0 ? (
            <p className="text-gray-500">No Outgoing requests.</p>
          ) : (
            outgoing.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white  dark:bg-gray-700 shadow p-4 rounded-lg"
              >
                <div>
                  <p className="font-semibold dark:text-lime-400">{req.to_username}</p>
                  <p className="text-sm text-gray-500 dark:text-white">
                    Habit: {req.habit_title}
                  </p>
                </div>
                <div>
                  <span
                    className={"px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
