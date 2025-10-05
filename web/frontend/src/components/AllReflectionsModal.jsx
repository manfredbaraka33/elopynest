import React, { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { use } from "react";



export default function AllReflectionsModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reflections, setReflections] = useState([]);
  const {getData}=useApi();


  const getReflections=async ()=>{
        setLoading(true);
        setError(null);
    try{
        const res = await getData("/user/reflections");
        console.log(res);
        setReflections(res);
    }
    catch(err){
        console.log(err)
    }
  finally{
  setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    getReflections()  
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Close reflections modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          All Reflections
        </h2>

        {loading && <p className="text-gray-700 dark:text-gray-300">Loading...</p>}

        {error && (
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        )}

        {!loading && !error && reflections.length === 0 && (
          <p className="text-gray-700 dark:text-gray-300">No reflections found.</p>
        )}

        <div className="space-y-6">
          {reflections.map(({ habit, habit_title, date, text }) => (
            <div
              key={habit}
              className="border border-gray-300 dark:border-gray-600 rounded p-4 bg-gray-50 dark:bg-gray-700"
            >
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Habit: {habit_title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Date: {new Date(date).toLocaleDateString()}
              </p>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
