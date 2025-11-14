import { useState, useRef, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Homepage from './pages/Homepage';
import Lifepage from './pages/Lifepage';
import Statspage from './pages/Statspage';
import MobileSidebar from './components/mobileSidebar';
import Cardspage from './pages/Cardspage';

function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // ✅ Detect clicks outside sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="App">
      {/* Normal desktop sidebar */}
      <Sidebar setCurrentPage={setCurrentPage} />

      {/* Hamburger button (separate from sidebar) */}
      <button
        className="Hamburger"
        aria-label="Menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {/* Mobile Sidebar (only renders when open) */}
      {menuOpen && (
        <MobileSidebar
          sidebarRef={sidebarRef}
          setCurrentPage={(page) => {
            setCurrentPage(page);
            setMenuOpen(false);
          }}
          currentPage={currentPage}
        />
      )}

      <div className='content'>
        {currentPage === "Home" && <Homepage />}
        {currentPage === "Life" && <Lifepage />}
        {currentPage === "Stats" && <Statspage />}
        {currentPage === "Cards" && <Cardspage/>}
      </div>
    </div>
  );
}

export default App;
