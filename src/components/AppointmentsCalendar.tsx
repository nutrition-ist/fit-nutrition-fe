"use client";

import React, { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from "@mui/material";

interface Appointment {
  id: number;
  patient: number;
  dietician: number;
  date_time: string; //  "2023-08-31T10:00:00"
  is_active: boolean;
}

interface AppointmentsCalendarProps {
  appointments: Appointment[];

  workingHours?: {
    startHour: number;
    endHour: number;
  };
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  appointments,
  workingHours = { startHour: 9, endHour: 17 },
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  // Collect all appointment date/times in Dayjs format for easier comparisons
  const appointmentsByDay = useMemo(() => {
    // Group appointments by date (YYYY-MM-DD)
    return appointments.reduce((acc, appt) => {
      const apptDate = dayjs(appt.date_time).format("YYYY-MM-DD");
      if (!acc[apptDate]) {
        acc[apptDate] = [];
      }
      acc[apptDate].push(appt);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }, [appointments]);

  const shouldDisableDate = (date: Dayjs) => {
    // disable dates in the past
    if (date.isBefore(dayjs().startOf("day"))) {
      return true;
    }

    //disable days that are fully booked
    const dateKey = date.format("YYYY-MM-DD");
    const dayAppointments = appointmentsByDay[dateKey] || [];

    // if each hour is booked its fully'fully booked'
    const totalHours = workingHours.endHour - workingHours.startHour;
    if (dayAppointments.length >= totalHours) {
      return true;
    }

    return false;
  };

  // For the currently selected date figure out which hours are free or booked
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dateKey = selectedDate.format("YYYY-MM-DD");
    const dayAppointments = appointmentsByDay[dateKey] || [];
    const bookedHours = dayAppointments.map((appt) =>
      dayjs(appt.date_time).hour()
    );

    const hours = [];
    for (
      let hour = workingHours.startHour;
      hour < workingHours.endHour;
      hour++
    ) {
      // If that hour is included in the 'bookedHours' array, then it's occupied
      const isBooked = bookedHours.includes(hour);
      hours.push({
        hour,
        isBooked,
      });
    }

    return hours;
  }, [selectedDate, appointmentsByDay, workingHours]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
        {/* The Calendar */}
        <Card sx={{ minWidth: 280 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select a Date
            </Typography>
            <DateCalendar
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              shouldDisableDate={shouldDisableDate}
            />
          </CardContent>
        </Card>

        {/* The Time Slots for the selected date */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedDate
                ? `Availability on ${selectedDate.format("MMMM DD, YYYY")}`
                : "Select a date to view availability"}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!selectedDate || timeSlots.length === 0 ? (
              <Alert severity="info">
                No date selected or no hours defined.
              </Alert>
            ) : (
              <List>
                {timeSlots.map(({ hour, isBooked }) => (
                  <ListItem
                    key={hour}
                    sx={{
                      bgcolor: isBooked ? "grey.200" : "success.light",
                      mb: 1,
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={`${hour}:00 - ${hour + 1}:00`}
                      secondary={isBooked ? "Booked" : "Available"}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentsCalendar;
