"use client";

import dayjs from "@/lib/dayjs";
import { useMemo, useState } from "react";

export default function Calendar() {
  const [calendar, setCalendar] = useState(dayjs());

  const month = useMemo(() => {
    const startOf = calendar.startOf("month");
    const endOf = calendar.endOf("month");

    const startDate = startOf.startOf("week");
    const endDate = endOf.endOf("week");

    const currentMonth = [];
    let date = startDate;

    while (date.isSameOrBefore(endDate, "day")) {
      currentMonth.push(date);
      date = date.add(1, "day");
    }

    return currentMonth;
  }, [calendar]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7">
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((day) => (
          <div
            key={day}
            className="border py-1.5 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {month.map((date) => {
          return (
            <div
              key={date.toString()}
              className={`border p-3 flex justify-end ${
                date.isSame(dayjs(), "day") && "bg-white text-black"
              }`}
            >
              {date.date()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
