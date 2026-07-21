import { useEffect, useMemo, useState } from "react";
import styles from "./FlightCalendar.module.css";

export default function FlightCalendar({
  title,
  selectedDate,
  onSelectDate,
  availableDates = [],
  minDate = "",
}) {
  const getInitialMonth = () => {
    if (!selectedDate) {
      return new Date();
    }

    const [year, month] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, 1);
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth);

  const availableSet = useMemo(() => {
    const dates = Array.isArray(availableDates) ? availableDates : [];

    return new Set(
      dates
        .filter((item) => {
          return (
            item &&
            item.date &&
            (item.available === true ||
              item.available === "true" ||
              item.hasFlights === true ||
              item.hasFlights === "true")
          );
        })
        .map((item) => String(item.date).substring(0, 10))
    );
  }, [availableDates]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const [year, month] = selectedDate.split("-").map(Number);
    setCurrentMonth(new Date(year, month - 1, 1));
  }, [selectedDate]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    days.push({
      number: day,
      date,
    });
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button type="button" onClick={prevMonth}>
          ‹
        </button>

        <span>
          {title} —{" "}
          {currentMonth.toLocaleString("es-AR", {
            month: "long",
            year: "numeric",
          })}
        </span>

        <button type="button" onClick={nextMonth}>
          ›
        </button>
      </div>

      <div className={styles.weekDays}>
        <span>DOM</span>
        <span>LUN</span>
        <span>MAR</span>
        <span>MIÉ</span>
        <span>JUE</span>
        <span>VIE</span>
        <span>SÁB</span>
      </div>

      <div className={styles.grid}>
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className={styles.empty} />;
          }

          const available = availableSet.has(day.date);
          const beforeMinimumDate = Boolean(
            minDate && day.date < minDate
          );

          const selectable = available && !beforeMinimumDate;
          const selected = selectedDate === day.date;

          return (
            <div
              key={day.date}
              className={`${styles.day} ${
                selectable ? styles.available : styles.unavailable
              } ${selected ? styles.selected : ""}`}
              onClick={() => {
                if (selectable) {
                  onSelectDate(day.date);
                }
              }}
            >
              {day.number}
            </div>
          );
        })}
      </div>
    </div>
  );
}