import axios from 'axios';
import TUICalendar from '@toast-ui/react-calendar';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import 'tui-calendar/dist/tui-calendar.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

const calendars = [
  {
    id: '1',
    name: 'dailyPlan',
    color: '#222',
    bgColor: '#fff',
    dragBgColor: '#fff',
    borderColor: '#fff',
  },
  {
    id: '2',
    name: 'succeed',
    color: '#fff',
    bgColor: '#28a745',
    dragBgColor: '#28a745',
    borderColor: '#28a745',
  },
];

const Calendar = () => {
  const [schedules, setSchedules] = useState();
  const cal = useRef<any>(null);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API as string)
      .then((response) => {
        setSchedules(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const onClickSchedule = useCallback((e) => {
    const { calendarId, id } = e.schedule;
    cal.current.calendarInst.getElement(id, calendarId);
  }, []);

  const onBeforeCreateSchedule = useCallback((scheduleData) => {
    const schedule = {
      id: String(Math.random()),
      title: scheduleData.title,
      isAllDay: scheduleData.isAllDay,
      start: scheduleData.start,
      end: scheduleData.end,
      category: scheduleData.isAllDay ? 'allday' : 'time',
      dueDateClass: '',
      location: scheduleData.location,
      raw: {
        class: scheduleData.raw.class,
      },
      state: scheduleData.state,
    };

    cal.current.calendarInst.createSchedules([schedule]);
  }, []);

  const onBeforeDeleteSchedule = useCallback((res) => {
    const { id, calendarId } = res.schedule;

    cal.current.calendarInst.deleteSchedule(id, calendarId);
  }, []);

  const onBeforeUpdateSchedule = useCallback((e) => {
    const { schedule, changes } = e;
    changes.start = changes.start.toUTCString();
    changes.end = changes.end.toUTCString();
    cal.current.calendarInst.updateSchedule(schedule.id, schedule.calendarId, changes);
  }, []);

  function getFormattedTime(time: Date) {
    const date = new Date(time);
    const h = date.getHours();
    const m = date.getMinutes();

    return `${h}:${m}`;
  }

  function getTimeTemplate(schedule: any, isAllDay: boolean) {
    const html = [];

    if (!isAllDay) {
      html.push(`<strong>${getFormattedTime(schedule.start)}</strong> `);
    }
    if (schedule?.isPrivate) {
      html.push('<span class="calendar-font-icon ic-lock-b"></span>');
      html.push(' Private');
    } else {
      if (schedule?.isReadOnly) {
        html.push('<span class="calendar-font-icon ic-readonly-b"></span>');
      } else if (schedule.recurrenceRule) {
        html.push('<span class="calendar-font-icon ic-repeat-b"></span>');
      } else if (schedule.attendees.length) {
        html.push('<span class="calendar-font-icon ic-user-b"></span>');
      } else if (schedule.location) {
        html.push('<span class="calendar-font-icon ic-location-b"></span>');
      }
      html.push(` ${schedule?.title}`);
    }

    return html.join('');
  }

  const templates = {
    time(schedule: any) {
      return getTimeTemplate(schedule, false);
    },
  };

  return (
    <div className="App">
      <div className="flex">
        <h1>jaemu&apos;s daily goal</h1>
        <div>
          <span className="badge" /> : 완료
        </div>
      </div>
      <TUICalendar
        ref={cal}
        height="736px"
        view="month"
        useCreationPopup
        useDetailPopup
        template={templates}
        calendars={calendars}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeDeleteSchedule={onBeforeDeleteSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
      />
    </div>
  );
};

export default Calendar;
