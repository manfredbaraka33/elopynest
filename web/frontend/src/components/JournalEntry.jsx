import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

export default function JournalEntry({ p,onSaved }) {
  const { postData } = useApi();
  const [entry, setEntry] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry.trim()) return setMessage('Please write something before saving.');
    try {
     const text=entry;
     const res = await postData("user/addjournal/",{text,p})
      console.log("Here is the journalentry reponse",res);
      alert('Journal saved!');
      setEntry('');
      setMessage('');
      if (onSaved) onSaved();
    } catch (err) {
      setMessage('Error saving journal.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-gray-800  text-gray-600 dark:text-gray-300">
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your journal entry..."
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800  text-gray-600 dark:text-gray-300"
        rows={4}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-gradient-to-tr from-blue-400 via-purple-500 to-orange-400 text-white rounded hover:bg-blue-700"
      >
        Save Journal
      </button>
      {message && <p className="mt-2 text-sm text-red-500">{message}</p>}
    </form>
  );
}
