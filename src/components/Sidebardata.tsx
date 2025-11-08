import React from "react";
import "../App.css"
import home from "../assets/Home.png"
import heart from "../assets/Heart.png"
import playingcard from "../assets/playingcard.png"
import stats from "../assets/stats.png"
export const SidebarData = [
    {
        title: "Home",
        icon: <img src={home} id="icon"/>,
        link: "/home",
    },
    {
        title: "Life",
        icon: <img src={heart} id="icon"/>,
        link: "/home",
    },
    {
        title: "Cards",
        icon: <img src={playingcard} id="icon"/>,
        link: "/home",
    },
    {
        title: "Stats",
        icon: <img src={stats} id="icon"/>,
        link: "/home",
    },
]