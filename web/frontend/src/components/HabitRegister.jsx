import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { InfoIcon } from 'lucide-react';

export default function HabitRegister({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState("daily");
  const [scheduledDays, setScheduledDays] = useState([]);
  const [privacy, setPrivacy] = useState("private");
  const [allowBuddy, setAllowBuddy] = useState(false);

  // Buddy selection step states
  const [step, setStep] = useState(1); // 1 = habit form, 2 = buddy selection
  const [createdHabitId, setCreatedHabitId] = useState(null);
  const [potentialBuddies, setPotentialBuddies] = useState([]);
  const [selectedBuddies, setSelectedBuddies] = useState([]);

  const popularHabits = [
    "Drink water daily",
    "Morning workout",
    "Read 20 pages",
    "Meditate",
    "No sugar",
    "Sleep before 11 PM",
    "10,000 steps",
    "Gratitude journaling"
  ];

  const { postData, getData } = useApi();

  const daysOfWeek = [
    { key: "mon", label: "Mon" },
    { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" },
    { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" },
    { key: "sat", label: "Sat" },
    { key: "sun", label: "Sun" },
  ];


  useEffect(() => {
    if (!isOpen) {
      resetAll();
    }
  }, [isOpen]);

  
  useEffect(() => {
    if (privacy === "buddy") {
      setAllowBuddy(true);
    } else {
      setAllowBuddy(false);
      setPotentialBuddies([]);
      setSelectedBuddies([]);
    }
  }, [privacy]);

  const resetAll = () => {
    setTitle("");
    setDescription("");
    setScheduleType("daily");
    setScheduledDays([]);
    setPrivacy("private");
    setAllowBuddy(false);
    setStep(1);
    setCreatedHabitId(null);
    setPotentialBuddies([]);
    setSelectedBuddies([]);
  };

  
  const fetchPotentialBuddies = async (habitId) => {
    if (!habitId) return;
    try {
      const res = await getData(`user/habit/${habitId}/search-buddies/`);
      console.log(res);
      setPotentialBuddies(res);
    } catch (error) {
      console.error("Error fetching buddies:", error);
      setPotentialBuddies([]);
    }
  };

  const toggleBuddySelection = (buddyId) => {
    setSelectedBuddies((prev) =>
      prev.includes(buddyId)
        ? prev.filter((id) => id !== buddyId)
        : [...prev, buddyId]
    );
  };

  const handleHabitSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a habit title");
      return;
    }

    try {
      const habitRes = await postData('user/habit/create/', {
        title,
        description,
        schedule_type: scheduleType,
        scheduled_days: scheduleType === 'custom' ? scheduledDays : [],
        visibility: privacy,
        allow_buddy: allowBuddy
      });

      if (privacy === 'buddy') {
        setCreatedHabitId(habitRes.id);
        setStep(2); 
        fetchPotentialBuddies(habitRes.id);
      } else {
        onSuccess();
        onClose();
        resetAll();
      }
    } catch (error) {
      alert("Failed to add habit. Try again.");
      console.error(error);
    }
  };

  const handleBuddySubmit = async () => {
    try {
    await postData("user/habit/send-buddy-request/", {
      buddy_ids: selectedBuddies,  
      habitId:createdHabitId
    });

      alert("Buddy request sent");
      onSuccess();
      onClose();
      resetAll();
    } catch (error) {
      alert("Failed to send buddy requests. Try again.");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[151]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-lg max-h-[90vh] overflow-auto">
        {step === 1 && (
          <>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add a New Habit</h3>
            <form onSubmit={handleHabitSubmit} className="flex flex-col gap-4">
              {/* Habit Title */}
              <label className="text-gray-700 dark:text-gray-300 relative">
                Habit Title<span className="text-red-500">*</span>:
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Drink water daily"
                  required
                />
                {title && (
                  <ul className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 mt-1 w-full rounded shadow-lg max-h-40 overflow-y-auto">
                    {popularHabits
                      .filter(h => h.toLowerCase().includes(title.toLowerCase()) && h.toLowerCase() !== title.toLowerCase())
                      .map((habit, idx) => (
                        <li
                          key={idx}
                          onClick={() => setTitle(habit)}
                          className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          {habit}
                        </li>
                      ))}
                  </ul>
                )}
              </label>

              {/* Privacy Selector */}
              <label className="text-gray-700 dark:text-gray-300">
                Privacy Level: <span className='text-sm flex'><InfoIcon className='text-red-600 text-sm' /> <span className='text-red-600'>This choice is irreversible!</span></span>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="buddy">Buddy(Buddies) Only</option>
                </select>
              </label>

              {/* Schedule Type */}
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
                      onClick={() => {
                        setScheduledDays((prev) =>
                          prev.includes(day.key)
                            ? prev.filter((d) => d !== day.key)
                            : [...prev, day.key]
                        );
                      }}
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

              {/* Description */}
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

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    resetAll();
                  }}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Habit
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Select Buddies</h3>
            {potentialBuddies.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300 mb-4">No buddies found for this habit.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto mb-4">
                {potentialBuddies.map((buddy) => {
                  const buddyId = buddy.user?.id || buddy.user_id || buddy.id; // handle possible shapes
                  const buddyName = buddy.user?.username || buddy.username || buddy.name;
                  return (
                    <div key={buddyId} className="flex items-center gap-2 mb-2">
                      <span>{buddyName}</span>
                      <button
                        type="button"
                        onClick={() => toggleBuddySelection(buddyId)}
                        className={`px-2 py-1 rounded ${
                          selectedBuddies.includes(buddyId)
                            ? "bg-green-500 text-white"
                            : "bg-gray-300"
                        }`}
                      >
                        {selectedBuddies.includes(buddyId) ? "Selected" : "Select"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                  resetAll();
                }}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleBuddySubmit}
                disabled={selectedBuddies.length === 0}
                className={`px-4 py-2 rounded text-white ${
                  selectedBuddies.length === 0
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Send Requests
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


