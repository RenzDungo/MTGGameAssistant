import "../styles/mobile.css";
import { SidebarData } from "./Sidebardata";

interface SidebarProps {
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  setCurrentPage: (page: string) => void;
  currentPage?: string;
}

export default function MobileSidebar({
  setCurrentPage,
  sidebarRef,
  currentPage,
}: SidebarProps) {
  return (
    <div ref={sidebarRef} className="mobilesidebarpage">
      <ul className="mobilesidebarlist">
        {SidebarData.map((val, key) => (
          <li
            key={key}
            className={`row ${currentPage === val.title ? "active" : ""}`}
            onClick={() => setCurrentPage(val.title)}
          >
            <div id="icon">{val.icon}</div>
            <div id="title">{val.title}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
