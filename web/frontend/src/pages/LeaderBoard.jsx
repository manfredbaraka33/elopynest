

// import React, { useState, useEffect, useRef } from 'react';
// import { useApi } from '../hooks/useApi';
// import Header from '../components/Header';

// const Leaderboard = () => {
//     const [activeTab, setActiveTab] = useState('general');
//     const [generalData, setGeneralData] = useState([]);
//     const [habitData, setHabitData] = useState([]);
//     const [habits, setHabits] = useState([]);
//     const [selectedHabitId, setSelectedHabitId] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const { getData } = useApi();
//     const scrollContainerRef = useRef(null);

//     // Fetch list of habits for navigation
//     useEffect(() => {
//         const fetchHabits = async () => {
//             try {
//                 const response = await getData('leaderboard/habits/');
//                 if (Array.isArray(response)) {
//                     setHabits(response);
//                     if (response.length > 0) {
//                         setSelectedHabitId(response[0].id);
//                     }
//                 } else {
//                     setHabits([]);
//                 }
//             } catch (err) {
//                 console.error("Failed to fetch habits:", err);
//             }
//         };
//         fetchHabits();
//     }, []);

//     // Fetch leaderboard data based on the active tab and selected habit
//     useEffect(() => {
//         const fetchLeaderboard = async () => {
//             setLoading(true);
//             setError(null);
//             let url = '';

//             if (activeTab === 'general') {
//                 url = 'leaderboard/general/';
//             } else if (activeTab === 'habits' && selectedHabitId) {
//                 url = `leaderboard/habits/${selectedHabitId}/`;
//             }

//             if (!url) {
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const response = await getData(url);
//                 if (activeTab === 'general') {
//                     if (response && Array.isArray(response.leaderboard)) {
//                         setGeneralData(response.leaderboard);
//                     } else {
//                         setGeneralData([]);
//                     }
//                 } else if (activeTab === 'habits') {
//                     if (Array.isArray(response)) {
//                         setHabitData(response);
//                     } else {
//                         setHabitData([]);
//                     }
//                 }
//             } catch (err) {
//                 setError("Failed to fetch leaderboard.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchLeaderboard();
//     }, [activeTab, selectedHabitId]);

//     // Auto-scrolls the habit button list to keep the active button in view
//     useEffect(() => {
//         if (scrollContainerRef.current) {
//             const selectedButton = scrollContainerRef.current.querySelector(
//                 `.bg-green-600`
//             );
//             if (selectedButton) {
//                 selectedButton.scrollIntoView({
//                     behavior: 'smooth',
//                     block: 'nearest',
//                     inline: 'center',
//                 });
//             }
//         }
//     }, [selectedHabitId]);

//     const handleHabitSelect = (id) => {
//         setSelectedHabitId(id);
//     };

//     const dataToDisplay = activeTab === 'general' ? generalData : habitData;

//     return (
//         <div className="p-6">
//             <Header />
//             <br /><br />
//             <br />
//             <h1 className="text-3xl font-bold text-center mb-6">Leaderboards</h1>
//             <div className="flex gap-4 mb-6 justify-center">
//                 <button
//                     onClick={() => setActiveTab('general')}
//                     className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
//                     General XP
//                 </button>
//                 <button
//                     onClick={() => setActiveTab('habits')}
//                     className={`px-6 py-2 rounded-lg font-semibold ${activeTab === 'habits' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
//                     Habit Streaks
//                 </button>
//             </div>

//             {/* Display loading, error, or data */}
//             {loading ? (
//                 <div className="text-center">Loading...</div>
//             ) : error ? (
//                 <div className="text-center text-red-500">{error}</div>
//             ) : (
//                 <>
//                     {activeTab === 'habits' && (
//                         <div
//                             ref={scrollContainerRef}
//                             className="flex flex-nowrap gap-2 mb-4 justify-start overflow-x-auto px-4"
//                         >
//                             {Array.isArray(habits) && habits.length > 0 ? (
//                                 habits.map(habit => (
//                                     <button
//                                         key={habit.id}
//                                         type='button'
//                                         onClick={() => handleHabitSelect(habit.id)}
//                                         className={`flex-shrink-0 px-4 py-2 rounded-lg ${selectedHabitId === habit.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
//                                         {habit.title}
//                                     </button>
//                                 ))
//                             ) : (
//                                 <div className="text-center text-gray-500">No habits found.</div>
//                             )}
//                         </div>
//                     )}
                    
//                     {/* Main Leaderboard List */}
//                     {dataToDisplay && Array.isArray(dataToDisplay) && dataToDisplay.length > 0 ? (
//                         <ul className="space-y-4">
//                             {dataToDisplay.map((item, index) => (
//                                 <li key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
//                                     <div className="flex items-center space-x-4">
//                                         <span className="text-xl font-bold w-8 text-center">{index + 1}</span>
//                                         <span className="text-lg font-semibold">{item.user?.username}</span>
//                                     </div>
//                                     <span className="text-xl font-bold text-blue-600">
//                                         {activeTab === 'general'
//                                             ? `${item.xp} XP`
//                                             : item.streak === 0
//                                                 ? 'No Streak'
//                                                 : item.streak === 1
//                                                     ? `${item.streak} Day`
//                                                     : `${item.streak} Days`
//                                         }
//                                     </span>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <div className="text-center text-gray-500 p-6">
//                             No leaderboard data to display.
//                         </div>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default Leaderboard;




import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../hooks/useApi';
import Header from '../components/Header';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [generalData, setGeneralData] = useState([]);
    const [habitData, setHabitData] = useState([]);
    const [habits, setHabits] = useState([]);
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { getData } = useApi();
    const scrollContainerRef = useRef(null);

    // Fetch list of habits for navigation
    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const response = await getData('leaderboard/habits/');
                if (Array.isArray(response)) {
                    setHabits(response);
                    if (response.length > 0) {
                        setSelectedHabitId(response[0].id);
                    }
                } else {
                    setHabits([]);
                }
            } catch (err) {
                console.error("Failed to fetch habits:", err);
            }
        };
        fetchHabits();
    }, []);

    // Fetch leaderboard data based on the active tab and selected habit
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            let url = '';

            if (activeTab === 'general') {
                url = 'leaderboard/general/';
            } else if (activeTab === 'habits' && selectedHabitId) {
                url = `leaderboard/habits/${selectedHabitId}/`;
            }

            if (!url) {
                setLoading(false);
                return;
            }

            try {
                const response = await getData(url);
                if (activeTab === 'general') {
                    if (response && Array.isArray(response.leaderboard)) {
                        setGeneralData(response.leaderboard);
                    } else {
                        setGeneralData([]);
                    }
                } else if (activeTab === 'habits') {
                    if (Array.isArray(response)) {
                        setHabitData(response);
                    } else {
                        setHabitData([]);
                    }
                }
            } catch (err) {
                setError("Failed to fetch leaderboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [activeTab, selectedHabitId]);

    // Auto-scrolls the habit button list to keep the active button in view
    useEffect(() => {
        if (scrollContainerRef.current) {
            const selectedButton = scrollContainerRef.current.querySelector(
                `.bg-green-600`
            );
            if (selectedButton) {
                selectedButton.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }
        }
    }, [selectedHabitId]);

    const handleHabitSelect = (id) => {
        setSelectedHabitId(id);
    };

    const dataToDisplay = activeTab === 'general' ? generalData : habitData;

    return (
        <div className="p-6  dark:bg-gray-800 dark:text-white">
            <Header />
            <br /><br />
            <br />
            <h1 className="text-3xl font-bold text-center mb-6">Leaderboards</h1>
            
            {/* Tabs */}
            <div className="flex gap-4 mb-6 justify-center">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-300 ease-in-out ${
                        activeTab === 'general'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                >
                    General XP
                </button>
                <button
                    onClick={() => setActiveTab('habits')}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-300 ease-in-out ${
                        activeTab === 'habits'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                >
                    Habit Streaks
                </button>
            </div>

            {/* Display loading, error, or data */}
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : (
                <>
                    {/* Habit Selector */}
                    {activeTab === 'habits' && (
                        <div
                            ref={scrollContainerRef}
                            className="ycontainer flex flex-nowrap gap-2 mb-4 justify-start overflow-x-auto px-4"
                        >
                            {Array.isArray(habits) && habits.length > 0 ? (
                                habits.map((habit) => (
                                    <button
                                        key={habit.id}
                                        type="button"
                                        onClick={() => handleHabitSelect(habit.id)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors duration-300 ease-in-out ${
                                            selectedHabitId === habit.id
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 text-gray-800'
                                        }`}
                                    >
                                        {habit.title}
                                    </button>
                                ))
                            ) : (
                                <div className="text-center text-gray-500">No habits found.</div>
                            )}
                        </div>
                    )}
                    
                    {/* Main Leaderboard List */}
                    {dataToDisplay && Array.isArray(dataToDisplay) && dataToDisplay.length > 0 ? (
                        <ul className="space-y-4 transition-opacity duration-500 ease-in-out opacity-100">
                            {dataToDisplay.map((item, index) => (
                                <li
                                    key={item.id}
                                    className="dark:bg-gray-900 dark:text-white p-4 rounded-lg shadow-md  flex items-center justify-between transition-transform duration-300 ease-in-out hover:scale-[1.02]"
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xl font-bold w-8 text-center">{index + 1}</span>
                                        <span className="text-lg font-semibold">{item.user?.username}</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-600">
                                        {activeTab === 'general'
                                            ? `${item.xp} XP`
                                            : item.streak === 0
                                                ? 'No Streak'
                                                : item.streak === 1
                                                    ? `${item.streak} Day`
                                                    : `${item.streak} Days`
                                        }
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-gray-500 p-6">
                            No leaderboard data to display.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Leaderboard;
