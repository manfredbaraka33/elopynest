import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useApi } from '../hooks/useApi';
import { ArrowRightLeftIcon } from 'lucide-react';

function HabitCheckinVerticalCalendar({ habitId, isOpen, onClose,name }) {
  const { getData } = useApi();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const getUserCheckins= async()=>{
    try{
     const res = await getData(`user/habits/${habitId}/checkins/`);
     console.log("Habit....",res)  
     setCheckIns(res) 
    }
    catch(err){
        console.log(err)
    }finally{
    setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    getUserCheckins();
    
  }, [habitId, isOpen]);

  if (!isOpen) return null;

  const startDate = dayjs().subtract(3, 'month').startOf('week'); // Sunday start
  const endDate = dayjs().endOf('day');

  const weeks = [];
  let current = startDate;
  while (current.isBefore(endDate)) {
    weeks.push(current);
    current = current.add(1, 'week');
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const checkInSet = new Set(checkIns.map(ci => dayjs(ci.date).format('YYYY-MM-DD')));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[300]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="habit-calendar-title"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg flex flex-col p-6 shadow-lg"
        onClick={e => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '900px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <header className="flex items-center justify-between mb-4">
          <h2
            id="habit-calendar-title"
            className="text-2xl font-semibold text-gray-900 dark:text-white"
          >
           " {name}" Check-in
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-4xl font-bold leading-none"
          >
            &times;
          </button>
        </header>

        {loading && (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        )}
        {error && (
          <p className="text-center text-red-600 dark:text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <div
            className="overflow-x-auto"
            style={{ maxWidth: '100%' }}
            aria-label="Calendar showing habit check-ins over weeks"
          >
            <table className="border-collapse table-fixed w-full min-w-max text-center">
              <thead>
                <tr>
                  <th
                    className="border px-3 py-2 bg-gray-100 dark:bg-gray-800"
                    style={{
                      minWidth: 72,
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'inherit',
                      zIndex: 20,
                    }}
                    scope="col"
                  >
                    {/* Empty top-left */}
                  </th>
                  {weeks.map(weekStart => (
                    <th
                      key={weekStart.format('YYYY-MM-DD')}
                      className="border px-3 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300"
                      style={{ minWidth: 50 }}
                      scope="col"
                      title={weekStart.format('MMMM D, YYYY')}
                    >
                      {weekStart.format('MMM D')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekdays.map((dayName, dayIdx) => (
                  <tr key={dayName}>
                    <th
                      className="border px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-xs text-gray-700 dark:text-gray-300"
                      scope="row"
                      style={{
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'inherit',
                        zIndex: 10,
                        minWidth: 72,
                        width: 72,
                      }}
                    >
                      {dayName}
                    </th>
                    {weeks.map(weekStart => {
                      const date = weekStart.add(dayIdx, 'day').format('YYYY-MM-DD');
                      const checkedIn = checkInSet.has(date);
                      return (
                        <td
                          key={date}
                          className={`border px-3 py-3 transition-colors duration-200 cursor-default select-none ${
                            checkedIn
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                          title={`${date}${checkedIn ? ' - Checked In' : ' - No Check-In'}`}
                          aria-label={`${date}: ${checkedIn ? 'Checked In' : 'No Check-In'}`}
                        >
                          {checkedIn ? '✓' : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className='text-sm text-orange-700 my-2 text-center'> <center><ArrowRightLeftIcon /></center> <br /> 
        Scroll  right/left to view checkins  </div>
      </div>
    </div>
  );
}

export default HabitCheckinVerticalCalendar;

