// import React, { useEffect, useState } from 'react';
// import { useAuth } from "../contexts/AuthContext";
// import JournalEntry from '../components/JournalEntry';
// import { useApi } from '../hooks/useApi';
// import RoutineModal from '../components/RoutineModal';
// import MoodInput from '../components/MoodInput';
// import { CheckCircle, Trash2, Pencil, Menu, X, Sun, Moon,LineChart,ArrowUp, ArrowDown, ArrowRight, FlameIcon,CalendarDays} from "lucide-react";
// import JournalModal from '../components/JournalModal';
// import HabitRegister from '../components/HabitRegister';
// import MoodTrendModal from "../components/MoodTrendModal";
// import HabitCheckinVerticalCalendar from '../components/HabitCheckinCalendarModal';
// import ReflectionModal from '../components/ReflectionModal';
// import FeedbackModal from '../components/FeedbackModal';
// import AllReflectionsModal from '../components/AllReflectionsModal';
// import Header from '../components/Header';
// import HabitEditModal from '../components/HabitEditModal';


// export default function Dashboard() {
//   const { patchData, getData, deleteData,postData } = useApi();
//   const { token, logout, user: authUser } = useAuth();
//   const { username } = useAuth();
//   const [isHabitRegisterOpen, setHabitRegisterOpen] = useState(false);
//   const [isHabitEditModalOpen, setHabitEditModalOpen] = useState(false); 
//   const [habitToEdit, setHabitToEdit] = useState(null);
//   const [habits, setHabits] = useState([]);
//   const [isMoodTrendModalOpen, setMoodTrendModalOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [routines, setRoutines] = useState([]);
//   const [todayPrompt, setTodayPrompt] = useState("");
//   const [mood_score, setMoodScore] = useState();
//   const [xp, setXp] = useState();
//   const [streak, setStreak] = useState({});
//   const [isRoutineModalOpen, setRoutineModalOpen] = useState(false);
//   const [isJournalModalOpen, setJournalModalOpen] = useState(false);
//   const [level, setLevel] = useState(1);
//   const [darkMode, setDarkMode] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isHabitCheckInCalendarOpen, setHabitCheckInCalendarOpen] = useState(false);
//   const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState(null);
//   const [isReflectionModalOpen, setReflectionModalOpen] = useState(false);
//   const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
//   const [aiFeedback, setAiFeedback] = useState("");
//   const [currentHabitId, setCurrentHabitId] = useState(null);
//   const [currentHabit, setCurrentHabit] = useState(null);
//   const [isModalOpen, setModalOpen] = React.useState(false);
//   const [isLoadingFeedBack,setIsLoadingFeedBack]=useState(false);

 

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);

//   const fetchDashboardData = async () => {
//     try {
//       const res = await getData("user/dashboard/");
//       console.log("Here is data 1",res);
//       setUser(res?.name);
//       setRoutines(res?.routines || []);
//       setTodayPrompt(res?.today_prompt || "");
//       setMoodScore(res?.stats.mood_score);
//       setStreak(res?.stats.streak);
//       setXp(res?.stats.xp);
//       setLevel(res?.stats.level || 1);
//       const res2=await getData("user/habits/");
//       console.log("Here is data 2",res2);
//       setHabits(res2)
//     } catch (error) {
//       console.error("Failed to fetch dashboard data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, [authUser]);

//   const handleToggleStatus = async (id, currentStatus) => {
//     const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
//     try {
//       await patchData(`user/routine/${id}/`, { status: newStatus });
//       fetchDashboardData();
//     } catch (error) {
//       console.error('Failed to toggle routine status:', error);
//     }
//   };

//   const handleDeleteRoutine = async (id) => {
//     if (!confirm("Are you sure you want to delete this routine?")) return;
//     try {
//       await deleteData(`user/routine/${id}/delete/`);
//       fetchDashboardData();
//     } catch (error) {
//       console.error('Failed to delete routine:', error);
//     }
//   };

//   const handleEditRoutine = async (routine) => {
//     const newTitle = prompt("Edit routine title:", routine.title);
//     if (!newTitle || newTitle === routine.title) return;
//     try {
//       await patchData(`user/routine/${routine.id}/`, { title: newTitle });
//       fetchDashboardData();
//     } catch (error) {
//       console.error('Failed to edit routine:', error);
//     }
//   };


//       const handleCheckIn = async (habitId,status) => {

//         if(status==="inactive") {alert("This is not scheduled for today");
//            return;}

//         if(status==="active"){
//           alert("You already checked this habit!")
//         }else{
//            const confirmed = window.confirm("Are you sure you want to check in? This will activate the habit.");
//            if (!confirmed) return;

//            try {
//           const res = await postData(`user/habit/${habitId}/checkin/`);
//           await fetchDashboardData();
//           console.log("Here is...",res);
//           alert("Habit checked in!"); 
//           setCurrentHabitId(habitId);
//            // Find the full habit object from habits array
//           const habit = habits.find(h => h.id === habitId);
//           setCurrentHabit(habit);  // Save full habit object including title
//           setReflectionModalOpen(true);  
//         } catch (err) {
//           alert("Something went wrong, check in failed!");
//           console.error(err);
//         }
//         }
        
        
//       };



//     const handleDeleteHabit = async (id) => {
//     if (!confirm("Are you sure you want to delete this habit?")) return;
//     try {
//       await deleteData(`user/habit/${id}/delete/`);
//       fetchDashboardData();
//     } catch (error) {
//       console.error('Failed to delete habit:', error);
//     }
//   };

//     const handleEditHabit = async (habit) => {
//        setHabitToEdit(habit);
//     setHabitEditModalOpen(true);
//   };

//   const saveStreak = async(habit_id,streak)=>{
//     if(xp < 5) {
//       alert('You have no enough XPs to save your streak')
//        return;}
//     else{
//       if(!confirm(`5 XPs will be reducted to save your ${streak} day(s) streak`)) return;
//       try{
//         const res = await patchData(`user/save_streak/${habit_id}/`)  
//         console.log('Here is the save streak resp',res);
//         fetchDashboardData();
//         alert(`Congrats, your ${streak} day(s) streak has been redeemed!`)
//       }
//       catch(error){
//         console.log(error);
//         alert("Something went wrong!")
//       }

//     }
//   }

// const handleSaveReflection = async (text) => {
//   if (!currentHabitId) {
//     alert("Habit not selected.");
//     return;
//   }
//   const res=await postData(`/user/habits/${currentHabitId}/reflections/`, {
//     habit: currentHabitId,
//     text: text
//   });
//   console.log(res);
//   setReflectionModalOpen(false);
// };



// const handleSaveAndFeedback = async (text) => {
//   setFeedbackModalOpen(true);
//    setIsLoadingFeedBack(true);
//   try{
//     if (!currentHabitId) {
//     alert("Habit not selected.");
//     return;
//   }
//   await postData(`/user/habits/${currentHabitId}/reflections/`, {
//     text: text
//   });
//   // Conditionally set the scheduled_days based on the schedule_type
//   const scheduledDaysToSend = currentHabit.schedule_type === 'daily' ? null : currentHabit.scheduled_days;
//   console.log("Here is the current streak to send",currentHabit.streak);
//   const aiRes = await postData(`/ai/reflection-feedback/`, {
//             text: text,
//             mood_score: mood_score,
//             habit_title: currentHabit.title, 
//             streak: currentHabit.streak,
//             schedule_type: currentHabit.schedule_type,
//             scheduled_days: scheduledDaysToSend,
//             username: username, 
//         });

//   setAiFeedback(aiRes.feedback);
//    setReflectionModalOpen(false);
  
//   }
//   catch(err){
//     console.log(err);
//     alert("Something went wrong!")
//     setFeedbackModalOpen(false);
//     setReflectionModalOpen(false);
    
//   }
//   finally{
//     setIsLoadingFeedBack(false)
//   }
// };




//   if (!token) return <div className="p-6 text-gray-700">Loading dashboard...</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6 transition-colors duration-300 antialiased">
//       {/* Header */}

//      <Header username={username} logout={logout} />
//      {/* Main container */}
//       <div className="max-h-full pt-24">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="relative bg-gradient-to-tr from-green-200 via-gray-200 to-red-300 p-4 rounded-2xl shadow text-center">
//           {/* Trend Button in top-right corner */}
//             <button
//               onClick={() => setMoodTrendModalOpen(true)}
//                className="absolute top-2 right-2 p-2 rounded-full border border-blue-600 text-blue-700 hover:bg-blue-100 hover:border-blue-800 hover:text-blue-900 transition"
//               title="View Mood Trend"
//             >
//               <LineChart size={20} />
//             </button>

//             <h2 className="text-sm font-semibold text-gray-700">Mood Score</h2>
//             <p className="text-3xl font-bold text-blue-600">{mood_score ?? 'N/A'}</p>

//             <div className="mt-4 text-sm">
//               <MoodInput initialMood={mood_score} onSaved={fetchDashboardData} />
//             </div>

//             {/* Modal component (outside the visual card, but still inside the render tree) */}
//             <MoodTrendModal
//               isOpen={isMoodTrendModalOpen}
//               onClose={() => setMoodTrendModalOpen(false)}
//             />
//           </div>

//               {/* New card with 4 sub-cards */}
//                 <div className="bg-gradient-to-tr from-green-200 via-yellow-200 text-center to-orange-200 p-4 rounded-2xl shadow text-gray-800 dark:text-white">
//                   <h2  className="text-sm font-semibold text-gray-700 mb-3">Activity Overview</h2>
//                   <div className="grid grid-cols-2 gap-4 text-center">
//                     {/* Number of routines */}
//                     <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
//                       <h3 className="text-sm font-semibold">Routines (Tasks)</h3>
//                       <p className="text-2xl font-bold">{routines.length}</p>
//                     </div>
                    
//                     {/* Number of habits */}
//                     <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
//                       <h3 className="text-sm font-semibold">Habits</h3>
//                       <p className="text-2xl font-bold">{habits.length}</p>
//                     </div>

//                     {/* Task completion rate */}
//                     <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
//                       <h3 className="text-sm font-semibold">Task Completion</h3>
//                       <p className="text-2xl font-bold">
//                         {routines.length === 0
//                           ? 'N/A'
//                           : `${Math.round(
//                               (routines.filter(r => r.status === 'completed').length / routines.length) * 100
//                             )}%`}
//                       </p>
//                     </div>

//                     {/* Active habit rate */}
//                     <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
//                       <h3 className="text-sm font-semibold">Active Habits</h3>
//                       <p className="text-2xl font-bold">
//                         {habits.length === 0
//                           ? 'N/A'
//                           : `${Math.round(
//                               (habits.filter(h => h.status === 'active').length / habits.length) * 100
//                             )}%`}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//           <div className="bg-gradient-to-tr from-purple-200 via-gray-100 to-blue-500 p-4 rounded-2xl shadow text-center">
//             <h2 className="text-sm font-semibold text-black">XP</h2>
//             <p className="text-3xl font-bold text-purple-600">{xp ?? 'N/A'}</p>
//             <p className="text-sm text-gray-700 mt-1">Level: {level}</p>
//           </div>
//         </div>

//         {/* Journal Section */}
//         <section className="mb-6">
//           <div className="flex justify-between items-center mb-2">
//             <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today’s Journal</h2>
//             <button
//               onClick={() => setJournalModalOpen(true)}
//               className="bg-gradient-to-tr from-green-400 via-teal-900 to-cyan-400 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
//             >
//               My journals
//             </button>
//           </div>
//           <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
//             <p className="text-gray-700 dark:text-gray-300 italic">{todayPrompt}</p>
//             <JournalEntry onSaved={fetchDashboardData} p={todayPrompt} />
//           </div>
//           <JournalModal
//             isOpen={isJournalModalOpen}
//             onClose={() => setJournalModalOpen(false)}
//             onSuccess={fetchDashboardData}
//           />
//         </section>

//         {/* Routine Section */}
//         <section>
//           <div className="flex justify-between items-center mb-2">
//             <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today’s Routines</h2>
//             <button
//               onClick={() => setRoutineModalOpen(true)}
//               className="bg-gradient-to-tr from-blue-400 via-purple-500 to-orange-400 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
//             >
//               Add Routine
//             </button>
//           </div>

//           {routines.length === 0 ? (
//             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center text-gray-600 dark:text-gray-300">
//               <p>No routines set for today.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {routines.map((routine, idx) => (
//                 <div
//                   key={idx}
//                   className={`flex justify-between items-center p-4 rounded-2xl shadow text-white ${
//                     routine.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
//                   }`}
//                 >
//                   <div>
//                     <h3 className="text-md font-semibold">{routine?.title}</h3>
//                     <p className="text-sm">Status: {routine?.status}</p>
//                   </div>
//                   <div className="flex flex-col items-end gap-2 ml-4">
//                     <button onClick={() => handleToggleStatus(routine.id, routine.status)} title="Toggle Status">
//                       <CheckCircle className="w-5 h-5 hover:text-white/90" />
//                     </button>
//                     <button onClick={() => handleEditRoutine(routine)} title="Edit Routine">
//                       <Pencil className="w-5 h-5 hover:text-white/90" />
//                     </button>
//                     <button onClick={() => handleDeleteRoutine(routine.id)} title="Delete Routine">
//                       <Trash2 className="w-5 h-5 hover:text-white/90" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <RoutineModal
//             isOpen={isRoutineModalOpen}
//             onClose={() => setRoutineModalOpen(false)}
//             onSuccess={fetchDashboardData}
//           />
//         </section>

//       {/* Habit Management Section */}
//       <section className="mt-10">
        
//          <div className="flex justify-between">
//           <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Manage Your Habits</h2>
//             <div className='justify-between'>
//                         <button 
//           onClick={() => setModalOpen(true)}
//           className="bg-gradient-to-tr from-green-400 via-teal-900 to-cyan-400 hover:bg-green-600 text-white px-2 mx-2 py-2 rounded-lg mb-3"
//           >My Reflections</button>
//           <button
//             onClick={() => setHabitRegisterOpen(true)}
//             className="bg-gradient-to-tr from-green-400 via-teal-900 to-cyan-400 hover:bg-green-600 text-white px-2 mx-2 py-2 rounded-lg mb-3"
//           >
//             Add Habit
//           </button>
//             </div>
//         </div>
//         {habits.length === 0 ? (
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center text-gray-600 dark:text-gray-300 mb-4">
//             <p>No habits registered yet.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
//             {habits.map((habit, idx) => (
//               <div
//                 key={idx}
                
//                 className={`flex justify-between items-center p-4 rounded-2xl shadow text-white ${
//                               habit.status === 'active'
//                                 ? 'bg-green-500'
//                                 : habit.status === 'pending'
//                                 ? 'bg-yellow-500'
//                                 : habit.status === 'missed'
//                                 ? 'bg-red-500'
//                                 : habit.status === 'grace_period'
//                                 ? 'bg-gradient-to-tl from-green-400 via-red-500 to-yellow-300    purple-500'
//                                 :habit.status === 'inactive'
//                                 ? 'bg-slate-400'
//                                 : 'bg-blue-500' 
//                             }`}>
//                 <div>
//                   <h3 className="text-md font-bold">{habit?.title}</h3>
//                    <div className='flex justify-between'>Scheduled:  {habit.schedule_type === 'daily' ? (<span className='mx-2'>daily</span>):(<ul className='flex justify-evenly text-sm'>
//                     {habit.scheduled_days.map((d,ix)=>(<li key={ix} className='mx-2'>{d}</li>))}
//                    </ul>)}</div>
//                   {habit.description && <p className="text-sm">{habit.description}</p>}
//                   {habit.status === 'grace_period' && <p className="text-sm mt-1">Status: {'Grace period'}</p> }
//                   {habit.status != 'grace_period' && <p className="text-sm mt-1">Status: {habit?.status || 'pending'}</p> }
                  
//                     {/* Add streak + trend here */}
//                     <div className="flex items-center space-x-2 mt-1 text-xs text-gray-100/90">
//                       <span className="flex items-center gap-1">
//                         <FlameIcon className="w-4 h-4 text-yellow-400" />
//                         <span>{habit.streak == 0 && <span>No streak</span>} {habit.streak == 1 && <span>1 day</span>} {habit.streak > 1 && <span>{habit.streak} days</span>}</span>
//                          {habit?.status === "grace_period" && <span className='mx-4'>
//                           <button className='bg-slate-400 rounded shadow-md p-2' onClick={()=>saveStreak(habit?.id,habit?.streak)}>Save streak</button>
//                           </span>}
//                       </span>
//                     </div>
//                 </div>
//                   <div className="flex flex-col items-end gap-2 ml-4">
//                     <button onClick={() => handleCheckIn(habit.id, habit.status)} title="Habit Checkin">
//                       <CheckCircle className="w-5 h-5 hover:text-white/90" />
//                     </button>
//                     <button onClick={() => handleEditHabit(habit)} title="Edit Habit">
//                       <Pencil className="w-5 h-5 hover:text-white/90" />
//                     </button>
//                     <button onClick={() => handleDeleteHabit(habit.id)} title="Delete Habit">
//                       <Trash2 className="w-5 h-5 hover:text-white/90" />
//                     </button>
//                     <button
//                       onClick={() => {
//                         setSelectedHabitForCalendar(habit);
//                         setHabitCheckInCalendarOpen(true);
//                       }}
//                       title="View Check-In Calendar"
//                       className="hover:text-white/90"
//                     >
//                       <CalendarDays className="w-5 h-5" />
//                     </button>
//                     <HabitCheckinVerticalCalendar
                    
//                       isOpen={isHabitCheckInCalendarOpen}
//                       onClose={() => setHabitCheckInCalendarOpen(false)}
//                       habitId={selectedHabitForCalendar?.id}
//                       name={selectedHabitForCalendar?.title}
//                       onSuccess={fetchDashboardData}

//                     />

//                     {/* HabitEditModal component */}
//                     <HabitEditModal
//                       isOpen={isHabitEditModalOpen}
//                       onClose={() => setHabitEditModalOpen(false)}
//                       onSuccess={fetchDashboardData}
//                       habit={habitToEdit}
//                     />

                    
//                     <ReflectionModal
//                         isOpen={isReflectionModalOpen}
//                         onClose={() => setReflectionModalOpen(false)}
//                         onSave={handleSaveReflection}
//                         onSaveAndFeedback={handleSaveAndFeedback}
//                         isLoadingFeedBack={isLoadingFeedBack}
//                       />
                      
//                       <FeedbackModal
//                         isOpen={isFeedbackModalOpen}
//                         feedback={aiFeedback}
//                         onClose={() => setFeedbackModalOpen(false)}
//                          isLoadingFeedBack={isLoadingFeedBack}
//                       />

//                   </div>
//               </div>
//             ))}
//           </div>
//         )}

//           <HabitRegister
//             isOpen={isHabitRegisterOpen}
//             onClose={() => setHabitRegisterOpen(false)}
//             onSuccess={fetchDashboardData}
//           />

//           <AllReflectionsModal
//             isOpen={isModalOpen}
//             onClose={() => setModalOpen(false)}
//           />

//       </section>


//       </div>
//     </div>
//   );
// }





import React, { useEffect, useState } from 'react';
import { useAuth } from "../contexts/AuthContext";
import JournalEntry from '../components/JournalEntry';
import { useApi } from '../hooks/useApi';
import RoutineModal from '../components/RoutineModal';
import MoodInput from '../components/MoodInput';
import { CheckCircle, Trash2, Pencil, LineChart, ArrowUp, ArrowDown, ArrowRight, FlameIcon, CalendarDays } from "lucide-react";
import JournalModal from '../components/JournalModal';
import HabitRegister from '../components/HabitRegister';
import MoodTrendModal from "../components/MoodTrendModal";
import HabitCheckinVerticalCalendar from '../components/HabitCheckinCalendarModal';
import ReflectionModal from '../components/ReflectionModal';
import FeedbackModal from '../components/FeedbackModal';
import AllReflectionsModal from '../components/AllReflectionsModal';
import Header from '../components/Header';
import HabitEditModal from '../components/HabitEditModal';


export default function Dashboard() {
  const { patchData, getData, deleteData, postData } = useApi();
  const { token, logout, user: authUser } = useAuth();
  const { username } = useAuth();
  const [isHabitRegisterOpen, setHabitRegisterOpen] = useState(false);
  const [isHabitEditModalOpen, setHabitEditModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [habits, setHabits] = useState([]);
  const [isMoodTrendModalOpen, setMoodTrendModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [todayPrompt, setTodayPrompt] = useState("");
  const [mood_score, setMoodScore] = useState();
  const [xp, setXp] = useState();
  const [streak, setStreak] = useState({});
  const [isRoutineModalOpen, setRoutineModalOpen] = useState(false);
  const [isJournalModalOpen, setJournalModalOpen] = useState(false);
  const [level, setLevel] = useState(1);
  const [isHabitCheckInCalendarOpen, setHabitCheckInCalendarOpen] = useState(false);
  const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState(null);
  const [isReflectionModalOpen, setReflectionModalOpen] = useState(false);
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [currentHabitId, setCurrentHabitId] = useState(null);
  const [currentHabit, setCurrentHabit] = useState(null);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [isLoadingFeedBack, setIsLoadingFeedBack] = useState(false);
  const fetchDashboardData = async () => {
    try {
      const res = await getData("user/dashboard/");
      console.log("Here is data 1", res);
      setUser(res?.name);
      setRoutines(res?.routines || []);
      setTodayPrompt(res?.today_prompt || "");
      setMoodScore(res?.stats.mood_score);
      setStreak(res?.stats.streak);
      setXp(res?.stats.xp);
      setLevel(res?.stats.level || 1);
      const res2 = await getData("user/habits/");
      console.log("Here is data 2", res2);
      setHabits(res2)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [authUser]);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await patchData(`user/routine/${id}/`, { status: newStatus });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to toggle routine status:', error);
    }
  };

  const handleDeleteRoutine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this routine?")) return; // Using window.confirm
    try {
      await deleteData(`user/routine/${id}/delete/`);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete routine:', error);
    }
  };

  const handleEditRoutine = async (routine) => {
    const newTitle = window.prompt("Edit routine title:", routine.title); // Using window.prompt
    if (!newTitle || newTitle === routine.title) return;
    try {
      await patchData(`user/routine/${routine.id}/`, { title: newTitle });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to edit routine:', error);
    }
  };


  const handleCheckIn = async (habitId, status) => {

    if (status === "inactive") { window.alert("This is not scheduled for today"); // Using window.alert
      return;
    }

    if (status === "active") {
      window.alert("You already checked this habit!"); // Using window.alert
    } else {
      const confirmed = window.confirm("Are you sure you want to check in? This will activate the habit.");
      if (!confirmed) return;

      try {
        const res = await postData(`user/habit/${habitId}/checkin/`);
        await fetchDashboardData();
        console.log("Here is...", res);
        window.alert("Habit checked in!"); // Using window.alert
        setCurrentHabitId(habitId);
        // Find the full habit object from habits array
        const habit = habits.find(h => h.id === habitId);
        setCurrentHabit(habit);  // Save full habit object including title
        setReflectionModalOpen(true);
      } catch (err) {
        window.alert("Something went wrong, check in failed!"); // Using window.alert
        console.error(err);
      }
    }


  };



  const handleDeleteHabit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) return; 
    try {
      await deleteData(`user/habit/${id}/delete/`);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const handleEditHabit = async (habit) => {
    setHabitToEdit(habit);
    setHabitEditModalOpen(true);
  };

  const saveStreak = async (habit_id, streak) => {
    if (xp < 5) {
      window.alert('You have no enough XPs to save your streak') 
      return;
    }
    else {
      if (!window.confirm(`5 XPs will be reducted to save your ${streak} day(s) streak`)) return; 
      try {
        const res = await patchData(`user/save_streak/${habit_id}/`)
        console.log('Here is the save streak resp', res);
        fetchDashboardData();
        window.alert(`Congrats, your ${streak} day(s) streak has been redeemed!`) 
      }
      catch (error) {
        console.log(error);
        window.alert("Something went wrong!") 
      }

    }
  }

  const handleSaveReflection = async (text) => {
    if (!currentHabitId) {
      window.alert("Habit not selected."); 
      return;
    }
    const res = await postData(`/user/habits/${currentHabitId}/reflections/`, {
      habit: currentHabitId,
      text: text
    });
    console.log(res);
    setReflectionModalOpen(false);
  };



  const handleSaveAndFeedback = async (text) => {
    setFeedbackModalOpen(true);
    setIsLoadingFeedBack(true);
    try {
      if (!currentHabitId) {
        window.alert("Habit not selected."); 
        return;
      }
      await postData(`/user/habits/${currentHabitId}/reflections/`, {
        text: text
      });
      // Conditionally set the scheduled_days based on the schedule_type
      const scheduledDaysToSend = currentHabit.schedule_type === 'daily' ? null : currentHabit.scheduled_days;
      console.log("Here is the current streak to send", currentHabit.streak);
      const aiRes = await postData(`/ai/reflection-feedback/`, {
        text: text,
        mood_score: mood_score,
        habit_title: currentHabit.title,
        streak: currentHabit.streak,
        schedule_type: currentHabit.schedule_type,
        scheduled_days: scheduledDaysToSend,
        username: username,
      });

      setAiFeedback(aiRes.feedback);
      setReflectionModalOpen(false);

    }
    catch (err) {
      console.log(err);
      window.alert("Something went wrong!")
      setFeedbackModalOpen(false);
      setReflectionModalOpen(false);

    }
    finally {
      setIsLoadingFeedBack(false)
    }
  };




  if (!token) return <div className="p-6 text-gray-700">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300 antialiased">
      {/* Header */}
      <Header className="z-100"  />

      {/* Main layout container for sidebar and content */}
      <div className="flex flex-1 pt-16"> 

        {/* Main content area */}
        <div className="flex-1 p-6 max-h-full overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative bg-gradient-to-tr from-green-200 via-gray-200 to-red-300 p-4 rounded-2xl shadow text-center">
              {/* Trend Button in top-right corner */}
              <button
                onClick={() => setMoodTrendModalOpen(true)}
                className="absolute top-2 right-2 p-2 rounded-full border border-blue-600 text-blue-700 hover:bg-blue-100 hover:border-blue-800 hover:text-blue-900 transition"
                title="View Mood Trend"
              >
                <LineChart size={20} />
              </button>

              <h2 className="text-sm font-semibold text-gray-700">Mood Score</h2>
              <p className="text-3xl font-bold text-blue-600">{mood_score ?? 'N/A'}</p>

              <div className="mt-4 text-sm">
                <MoodInput initialMood={mood_score} onSaved={fetchDashboardData} />
              </div>

               {/* Conditionally render the modal outside of the main content flow */}
                {isMoodTrendModalOpen && (
                  <MoodTrendModal
                    isOpen={isMoodTrendModalOpen}
                    onClose={() => setMoodTrendModalOpen(false)}
                  />
                )}

            </div>

            {/* New card with 4 sub-cards */}
            <div className="bg-gradient-to-tr from-green-200 via-yellow-200 text-center to-orange-200 p-4 rounded-2xl shadow text-gray-800 dark:text-white">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Activity Overview</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                {/* Number of routines */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
                  <h3 className="text-sm font-semibold">Routines (Tasks)</h3>
                  <p className="text-2xl font-bold">{routines.length}</p>
                </div>

                {/* Number of habits */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
                  <h3 className="text-sm font-semibold">Habits</h3>
                  <p className="text-2xl font-bold">{habits.length}</p>
                </div>

                {/* Task completion rate */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
                  <h3 className="text-sm font-semibold">Task Completion</h3>
                  <p className="text-2xl font-bold">
                    {routines.length === 0
                      ? 'N/A'
                      : `${Math.round(
                        (routines.filter(r => r.status === 'completed').length / routines.length) * 100
                      )}%`}
                  </p>
                </div>

                {/* Active habit rate */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow">
                  <h3 className="text-sm font-semibold">Active Habits</h3>
                  <p className="text-2xl font-bold">
                    {habits.length === 0
                      ? 'N/A'
                      : `${Math.round(
                        (habits.filter(h => h.status === 'active').length / habits.length) * 100
                      )}%`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-purple-200 via-gray-100 to-blue-500 p-4 rounded-2xl shadow text-center">
              <h2 className="text-sm font-semibold text-black">XP</h2>
              <p className="text-3xl font-bold text-purple-600">{xp ?? 'N/A'}</p>
              <p className="text-sm text-gray-700 mt-1">Level: {level}</p>
            </div>
          </div>

          {/* Journal Section */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today’s Journal</h2>
              <button
                onClick={() => setJournalModalOpen(true)}
                className="bg-gradient-to-tr from-green-400 via-teal-900 to-cyan-400 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                My journals
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
              <p className="text-gray-700 dark:text-gray-300 italic">{todayPrompt}</p>
              <JournalEntry onSaved={fetchDashboardData} p={todayPrompt} />
            </div>
            <JournalModal
              isOpen={isJournalModalOpen}
              onClose={() => setJournalModalOpen(false)}
              onSuccess={fetchDashboardData}
            />
          </section>

          {/* Routine Section */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today’s Routines</h2>
              <button
                onClick={() => setRoutineModalOpen(true)}
                className="bg-gradient-to-tr from-blue-400 via-purple-500 to-orange-400 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Add Routine
              </button>
            </div>

            {routines.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center text-gray-600 dark:text-gray-300">
                <p>No routines set for today.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {routines.map((routine, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-4 rounded-2xl shadow text-white ${
                      routine.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  >
                    <div>
                      <h3 className="text-md font-semibold">{routine?.title}</h3>
                      <p className="text-sm">Status: {routine?.status}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <button onClick={() => handleToggleStatus(routine.id, routine.status)} title="Toggle Status">
                        <CheckCircle className="w-5 h-5 hover:text-white/90" />
                      </button>
                      <button onClick={() => handleEditRoutine(routine)} title="Edit Routine">
                        <Pencil className="w-5 h-5 hover:text-white/90" />
                      </button>
                      <button onClick={() => handleDeleteRoutine(routine.id)} title="Delete Routine">
                        <Trash2 className="w-5 h-5 hover:text-white/90" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <RoutineModal
              isOpen={isRoutineModalOpen}
              onClose={() => setRoutineModalOpen(false)}
              onSuccess={fetchDashboardData}
            />
          </section>

          {/* Habit Management Section */}
          <section className="mt-10">

            <div className="flex justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Manage Your Habits</h2>
              <div className='justify-between'>
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-gradient-to-tr from-green-400 via-teal-900 to-cyan-400 hover:bg-green-600 text-white px-2 mx-2 py-2 rounded-lg mb-3"
                >My Reflections</button>
                <button
                  onClick={() => setHabitRegisterOpen(true)}
                  className="bg-gradient-to-tr from-green-400 via-teal-900 to-cyan-400 hover:bg-green-600 text-white px-2 mx-2 py-2 rounded-lg mb-3"
                >
                  Add Habit
                </button>
              </div>
            </div>
            {habits.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center text-gray-600 dark:text-gray-300 mb-4">
                <p>No habits registered yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {habits.map((habit, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-4 rounded-2xl shadow text-white ${
                      habit.status === 'active'
                        ? 'bg-green-500'
                        : habit.status === 'pending'
                          ? 'bg-yellow-500'
                          : habit.status === 'missed'
                            ? 'bg-red-500'
                            : habit.status === 'grace_period'
                              ? 'bg-gradient-to-tl from-green-400 via-red-500 to-yellow-300'
                              : habit.status === 'inactive'
                                ? 'bg-slate-400'
                                : 'bg-blue-500'
                    }`}>
                    <div>
                      <h3 className="text-md font-bold">{habit?.title}</h3>
                      <div className='flex justify-between'>Scheduled:  {habit.schedule_type === 'daily' ? (<span className='mx-2'>daily</span>) : (<ul className='flex justify-evenly text-sm'>
                        {habit.scheduled_days.map((d, ix) => (<li key={ix} className='mx-2'>{d}</li>))}
                      </ul>)}</div>
                      {habit.description && <p className="text-sm">{habit.description}</p>}
                      {habit.status === 'grace_period' && <p className="text-sm mt-1">Status: {'Grace period'}</p>}
                      {habit.status != 'grace_period' && <p className="text-sm mt-1">Status: {habit?.status || 'pending'}</p>}

                      {/* Add streak + trend here */}
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-100/90">
                        <span className="flex items-center gap-1">
                          <FlameIcon className="w-4 h-4 text-yellow-400" />
                          <span>{habit.streak === 0 && <span>No streak</span>} {habit.streak === 1 && <span>1 day</span>} {habit.streak > 1 && <span>{habit.streak} days</span>}</span>
                          {habit?.status === "grace_period" && <span className='mx-4'>
                            <button className='bg-slate-400 rounded shadow-md p-2' onClick={() => saveStreak(habit?.id, habit?.streak)}>Save streak</button>
                          </span>}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <button onClick={() => handleCheckIn(habit.id, habit.status)} title="Habit Checkin">
                        <CheckCircle className="w-5 h-5 hover:text-white/90" />
                      </button>
                      <button onClick={() => handleEditHabit(habit)} title="Edit Habit">
                        <Pencil className="w-5 h-5 hover:text-white/90" />
                      </button>
                      <button onClick={() => handleDeleteHabit(habit.id)} title="Delete Habit">
                        <Trash2 className="w-5 h-5 hover:text-white/90" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHabitForCalendar(habit);
                          setHabitCheckInCalendarOpen(true);
                        }}
                        title="View Check-In Calendar"
                        className="hover:text-white/90"
                         >
                        <CalendarDays className="w-5 h-5" />
                      </button>

                      <HabitCheckinVerticalCalendar
                        isOpen={isHabitCheckInCalendarOpen}
                        onClose={() => setHabitCheckInCalendarOpen(false)}
                        habitId={selectedHabitForCalendar?.id}
                        name={selectedHabitForCalendar?.title}
                        onSuccess={fetchDashboardData}

                      />

                      <HabitEditModal
                        isOpen={isHabitEditModalOpen}
                        onClose={() => setHabitEditModalOpen(false)}
                        onSuccess={fetchDashboardData}
                        habit={habitToEdit}
                      />


                      <ReflectionModal
                        isOpen={isReflectionModalOpen}
                        onClose={() => setReflectionModalOpen(false)}
                        onSave={handleSaveReflection}
                        onSaveAndFeedback={handleSaveAndFeedback}
                        isLoadingFeedBack={isLoadingFeedBack}
                      />

                      <FeedbackModal
                        isOpen={isFeedbackModalOpen}
                        feedback={aiFeedback}
                        onClose={() => setFeedbackModalOpen(false)}
                        isLoadingFeedBack={isLoadingFeedBack}
                      />

                    </div>
                  </div>
                ))}
              </div>
            )}

            <HabitRegister
              isOpen={isHabitRegisterOpen}
              onClose={() => setHabitRegisterOpen(false)}
              onSuccess={fetchDashboardData}
            />

            <AllReflectionsModal
              isOpen={isModalOpen}
              onClose={() => setModalOpen(false)}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
