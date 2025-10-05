import { LayoutDashboardIcon, ListOrderedIcon, PersonStanding } from 'lucide-react';
import useClickedOutside from '../hooks/useClickedOutside'; 
import { Link } from 'react-router-dom';


function Sidebar({ isSidebarOpen, logout, onClose }) { 
  // Use the custom hook to get a ref and handle clicks outside the sidebar
  const sidebarRef = useClickedOutside(() => {
    // Only close the sidebar if it's currently open
    if (isSidebarOpen) {
      onClose(); 
    }
  });

  return (
    <aside
      // Attach the ref to the root element of the sidebar
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full w-64
        bg-gradient-to-b via-yellow-700 from-blue-900 to-indigo-900 text-white
        dark:from-gray-800 dark:via-gray-800 dark:to-black
        shadow-md p-4 transition-transform duration-300 ease-in-out transform z-[100]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col justify-between pt-20`}
    >
      <div>
        <nav className="space-y-2 my-3">   
          
          <Link to="/" className="block p-2 rounded hover:bg-blue-600 dark:hover:bg-gray-700 flex gap-2" onClick={()=>onClose()} ><LayoutDashboardIcon /> Dashboard</Link>
          <Link to="/buddy-requests" className="block p-2 rounded hover:bg-blue-600 dark:hover:bg-gray-700 flex gap-2" onClick={()=>onClose()}  ><PersonStanding/> Buddy Requests</Link>
          <Link to="/leaderboard" className="block p-2 rounded hover:bg-blue-600 dark:hover:bg-gray-700 flex gap-2" onClick={()=>onClose()}  ><ListOrderedIcon/> Leaderboard</Link>
          <Link to="/my-profile" className="block p-2 rounded hover:bg-blue-600 dark:hover:bg-gray-700 flex gap-2" onClick={()=>onClose()} >  👤  My profile</Link>
          <Link to="#" className="block p-2 rounded hover:bg-blue-600 dark:hover:bg-gray-700 flex gap-2" onClick={()=>onClose()} >⚙ Settings</Link>
          
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-blue-600 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

