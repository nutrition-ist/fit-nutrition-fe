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
  Stack,
  Button,
} from "@mui/material";

export interface Appointment {
  id: number;
  patient: number;
  dietician: number;
  date_time: string;
  is_active: boolean;
}

export type Role = "patient" | "dietitian";

export interface AppointmentsCalendarProps {
  appointments: Appointment[];
  workingHours?: {
    startHour: number;
    endHour: number;
  };
  role?: Role;
  onCreate?: (dateTimeIso: string) => void; 
  onDelete?: (appointmentId: number) => void;
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  appointments,
  workingHours = { startHour: 9, endHour: 17 },
  role = "patient",
  onCreate,
  onDelete,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const appointmentsByDay = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
      const k = dayjs(appt.date_time).format("YYYY-MM-DD");
      (acc[k] ||= []).push(appt);
      return acc;
    }, {});
  }, [appointments]);

  const shouldDisableDate = (date: Dayjs): boolean => {
    if (date.isBefore(dayjs().startOf("day"))) return true;

    const dateKey = date.format("YYYY-MM-DD");
    const dayAppointments = appointmentsByDay[dateKey] || [];
    const totalHours = workingHours.endHour - workingHours.startHour;

    return dayAppointments.length >= totalHours;
  };

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dateKey = selectedDate.format("YYYY-MM-DD");
    const dayAppointments = (appointmentsByDay[dateKey] || []).sort(
      (a, b) => dayjs(a.date_time).valueOf() - dayjs(b.date_time).valueOf()
    );
    const bookedByHour = new Map<number, Appointment>();
    dayAppointments.forEach((a) => {
      bookedByHour.set(dayjs(a.date_time).hour(), a);
    });

    const out: Array<
      | { hour: number; isBooked: false }
      | { hour: number; isBooked: true; appt: Appointment }
    > = [];

    for (
      let hour = workingHours.startHour;
      hour < workingHours.endHour;
      hour++
    ) {
      const appt = bookedByHour.get(hour);
      if (appt) out.push({ hour, isBooked: true, appt });
      else out.push({ hour, isBooked: false });
    }
    return out;
  }, [selectedDate, appointmentsByDay, workingHours]);

  const handleBook = (hour: number) => {
    if (!selectedDate || !onCreate) return;
    const dt = selectedDate.hour(hour).minute(0).second(0).millisecond(0);
    onCreate(dt.toISOString());
  };

  const handleCancel = (id: number) => {
    if (!onDelete) return;
    onDelete(id);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
        {/* Calendar */}
        <Card sx={{ minWidth: 280 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Select a Date
            </Typography>
            <DateCalendar
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              shouldDisableDate={shouldDisableDate}
            />
          </CardContent>
        </Card>

        {/* Slots list */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
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
                {timeSlots.map((slot) => {
                  const hourLabel = `${slot.hour}:00 - ${slot.hour + 1}:00`;
                  if (slot.isBooked) {
                    return (
                      <ListItem
                        key={slot.hour}
                        sx={{ bgcolor: "grey.100", mb: 1, borderRadius: 1 }}
                        secondaryAction={
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleCancel(slot.appt.id)}
                            >
                              Cancel
                            </Button>
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={hourLabel}
                          secondary={`Booked • ${dayjs(
                            slot.appt.date_time
                          ).format("h:mm A")}`}
                        />
                      </ListItem>
                    );
                  }

                  return (
                    <ListItem
                      key={slot.hour}
                      sx={{ bgcolor: "success.light", mb: 1, borderRadius: 1 }}
                      secondaryAction={
                        role === "patient" ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleBook(slot.hour)}
                          >
                            Book
                          </Button>
                        ) : null
                      }
                    >
                      <ListItemText primary={hourLabel} secondary="Available" />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentsCalendar;
