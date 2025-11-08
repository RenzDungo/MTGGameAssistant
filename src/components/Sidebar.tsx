import "../App.css"
import {SidebarData} from "./Sidebardata"
interface SidebarProps{
    setCurrentPage: (page: string) => void;
    currentPage?: string;
}
export default function Sidebar ({setCurrentPage}: SidebarProps) {
    return(
            <div className="Sidebar">
                <ul className="Sidebarlist">
                    {SidebarData.map((val,key) => {
                        return (
                            <li 
                            key={key}
                            className="row"
                            onClick={()=> setCurrentPage(val.title)}
                            >
                                <div>
                                    {val.icon}
                                </div> {" "}
                                <div id="title">
                                    {val.title}
                                </div> {" "}
                            </li>
                        )
                    })}
                </ul>
            </div>
    )
}