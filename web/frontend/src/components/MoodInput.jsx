import React, { useState ,useEffect} from 'react';
import { useApi } from '../hooks/useApi';


export default function MoodInput({ initialMood, onSaved }) {
  const { patchData } = useApi();
  const [mood, setMood] = useState(initialMood);
  const [message, setMessage] = useState('');

  useEffect(()=>{
    setMood(initialMood)
  },[initialMood])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mood === null) return setMessage('Please select a mood score.');
    try {
      const res = await patchData("user/stats/", { mood_score: mood });
      console.log("Here is the data for mood input",res);
      alert('Mood score updated!');
      if (onSaved) onSaved();
    } catch (err) {
      setMessage('Error saving mood score.');
      console.log(err);
    }
  };

  return (
<form onSubmit={handleSubmit} className="mb-6">
  <label className="block mb-2 font-semibold text-gray-700">Mood Score</label>

  <div className="flex items-center space-x-4">
    <input
      type="range"
      min={0}
      max={10}
      value={mood ?? 5}
      onChange={(e) => setMood(parseInt(e.target.value))}
      className="w-full h-2 bg-gradient-to-tr from-red-500 via-yellow-400 to-green-500 rounded-lg appearance-none cursor-pointer accent-green-500"
    />
    <span className="text-green-700 font-semibold text-lg">{mood ?? 0}</span>
  </div>

  <button
    type="submit"
    className="mt-4 px-4 py-2 bg-gradient-to-tr from-blue-400 via-purple-500 to-orange-400 text-white rounded hover:bg-green-700"
  >
    Save Mood
  </button>
   

  {message && <p className="mt-2 text-sm text-red-500">{message}</p>}
</form>

  );
}
