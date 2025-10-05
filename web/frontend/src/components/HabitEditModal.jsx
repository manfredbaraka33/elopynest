import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function HabitEditModal({ isOpen, onClose, onSuccess, habit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState("daily");
  const [scheduledDays, setScheduledDays] = useState([]);
  const { patchData } = useApi();

  const daysOfWeek = [
    { key: "mon", label: "Mon" },
    { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" },
    { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" },
    { key: "sat", label: "Sat" },
    { key: "sun", label: "Sun" },
  ];

  // Effect to populate form fields when the modal opens with a new habit
  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || "");
      setScheduleType(habit.schedule_type);
      setScheduledDays(habit.scheduled_days || []);
    }
  }, [habit]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a habit title");
      return;
    }
    
    // Check if any data has actually changed
    const hasChanged = 
      title !== habit.title ||
      description !== (habit.description || "") ||
      scheduleType !== habit.schedule_type ||
      JSON.stringify(scheduledDays.sort()) !== JSON.stringify((habit.scheduled_days || []).sort());
      
    if (!hasChanged) {
      onClose(); 
      return;
    }

    try {
      const payload = {
        title,
        description,
        schedule_type: scheduleType,
        scheduled_days: scheduleType === 'custom' ? scheduledDays : [],
      };
      
      const res = await patchData(`user/habit/${habit.id}/`, payload);
      console.log("Updated habit:", res);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to update habit. Try again.");
      console.error(error);
    }
  };

  const handleDayToggle = (dayKey) => {
    setScheduledDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  if (!isOpen || !habit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-[200]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Habit: {habit.title}</h3>
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <label className="text-gray-700 dark:text-gray-300">
            Habit Title<span className="text-red-500">*</span>:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:text-white"
              placeholder="e.g. Drink water daily"
              required
            />
          </label>
          
          <label className="text-gray-700 dark:text-gray-300">
            Schedule Type:
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          {scheduleType === "custom" && (
            <div className="flex gap-2 flex-wrap">
              {daysOfWeek.map((day) => (
                <button
                  type="button"
                  key={day.key}
                  onClick={() => handleDayToggle(day.key)}
                  className={`px-3 py-1 rounded border ${
                    scheduledDays.includes(day.key)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          )}
          
          <label className="text-gray-700 dark:text-gray-300">
            Description (optional):
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:text-white"
              placeholder="Add details or reminders..."
              rows={3}
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}