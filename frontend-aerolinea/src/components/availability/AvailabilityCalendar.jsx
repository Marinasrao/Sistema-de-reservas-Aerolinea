import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './AvailabilityCalendar.module.css';

const AvailabilityCalendar = ({
    availableDates = [],
    selectedDate = null,
    onSelectDate = () => {},
}) => {

    const initialMonth =
        availableDates.length > 0
            ? new Date(availableDates[0].date)
            : new Date();

    const [activeMonth, setActiveMonth] = useState(initialMonth);

    const tileClassName = ({ date, view }) => {

        if (view !== 'month') {
            return styles.unavailable;
        }

        const iso = date.toISOString().split('T')[0];

        const found = availableDates.find(
            d => d.date === iso
        );

        if (found?.available) {
            return styles.available;
        }

        return styles.unavailable;
    };

    return (
        <Calendar
            activeStartDate={activeMonth}

            onActiveStartDateChange={({ activeStartDate }) =>
                setActiveMonth(activeStartDate)
            }

            showNeighboringMonth={false}
            showNavigation={true}

            value={selectedDate}

            onClickDay={(value) => {
                const iso = value.toISOString().split('T')[0];
                onSelectDate(iso);
            }}

            tileClassName={tileClassName}

            formatMonthYear={(locale, date) =>
                date.toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                })
            }
        />
    );
};

export default AvailabilityCalendar;