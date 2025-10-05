import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import dayjs from 'dayjs';

export default function MoodTrendModal({ isOpen, onClose }) {
  const { getData } = useApi();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMoodData = async () => {
      const res = await getData('user/moodtrend/');
      const formatted = res.map(entry => ({
        // Ensure ISO string for consistent parsing
        timestamp: dayjs(entry.timestamp).toISOString(),
        mood: entry.mood_score
      }));
      setData(formatted);
    };

    fetchMoodData();
  }, [isOpen]);

  if (!isOpen) return null;

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-700 p-2 rounded shadow text-sm">
          <p className="mb-1">{dayjs(label).format('MMM D, YYYY h:mm A')}</p>
          <p className="font-semibold">Mood: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={onClose}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] md:w-[600px] shadow-lg"
      onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Mood Trend</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => dayjs(value).format('MMM D')}
            />
            <YAxis domain={[1, 10]} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
