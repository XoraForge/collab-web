"use client";

import { useState } from "react";
import MainNav from "./sidenav-variants/MainNav";
import ExpandedDoubleNav from "./sidenav-variants/ExpandedDoubleNav";

export default function SideNav() {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <section className="flex bg-[#222222] h-full w-[250px] justify-between">
      {!isExpanded ? <MainNav /> : <ExpandedDoubleNav />}
    </section>
  );
}
