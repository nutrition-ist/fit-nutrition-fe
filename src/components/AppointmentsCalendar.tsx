"use client";

import React, { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

/** ---------------- Types ---------------- */
export interface Appointment {
  id: number;
  patient: number;
  dietician: number;
  date_time: string;
  is_active: boolean;
}

export interface AppointmentsCalendarProps {
  role?: "dietitian" | "patient";
  appointments: Appointment[];
  workingDays?: boolean[];
  workingHours?: {
    startHour: number;
    endHour: number;
    slotMinutes?: number;
  };
  blockedDates?: string[];
  onCreate?: (dateTimeIso: string) => Promise<void> | void;
  onDelete?: (id: number) => Promise<void> | void;
  onToggleBlockDate?: (date: string, block: boolean) => void;
}

/** --------------- Component --------------- */
const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  role = "patient",
  appointments,
  workingDays = [false, true, true, true, true, true, false],
  workingHours = { startHour: 9, endHour: 17, slotMinutes: 60 },
  blockedDates = [],
  onCreate,
  onDelete,
  onToggleBlockDate,
}) => {
  const slotMinutes = workingHours.slotMinutes ?? 60;
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const apptsByDay = useMemo(() => {
    return appointments.reduce((acc, appt) => {
      const key = dayjs(appt.date_time).format("YYYY-MM-DD");
      (acc[key] ||= []).push(appt);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }, [appointments]);

  const isBlocked = (date: Dayjs) =>
    blockedDates.includes(date.format("YYYY-MM-DD"));

  const isWorkingDay = (date: Dayjs) => workingDays[date.day()] === true;

  const shouldDisableDate = (date: Dayjs) => {
    // Past days
    if (date.isBefore(dayjs().startOf("day"))) return true;
    // Non-working days
    if (!isWorkingDay(date)) return true;
    // Entire day blocked
    if (isBlocked(date)) return true;
    return false;
  };

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.format("YYYY-MM-DD");
    const dayAppts = apptsByDay[key] || [];

    const bookedMap = new Map<string, Appointment>();
    dayAppts.forEach((a) => {
      const d = dayjs(a.date_time);
      bookedMap.set(`${d.hour()}:${d.minute()}`, a);
    });

    const list: {
      start: Dayjs;
      end: Dayjs;
      booked?: Appointment;
    }[] = [];

    const start = selectedDate
      .hour(workingHours.startHour)
      .minute(0)
      .second(0)
      .millisecond(0);

    const end = selectedDate
      .hour(workingHours.endHour)
      .minute(0)
      .second(0)
      .millisecond(0);

    for (
      let t = start.clone();
      t.isBefore(end);
      t = t.add(slotMinutes, "minute")
    ) {
      const key = `${t.hour()}:${t.minute()}`;
      list.push({
        start: t.clone(),
        end: t.clone().add(slotMinutes, "minute"),
        booked: bookedMap.get(key),
      });
    }

    return list;
  }, [
    selectedDate,
    apptsByDay,
    workingHours.endHour,
    workingHours.startHour,
    slotMinutes,
  ]);

  const dateTitle =
    selectedDate?.format("MMMM DD, YYYY") ?? "Select a date to view";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
        {/* Calendar */}
        <Card sx={{ minWidth: 280 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" component="h2" gutterBottom>
                Select a Date
              </Typography>
              {onToggleBlockDate && selectedDate && (
                <Chip
                  size="small"
                  color={isBlocked(selectedDate) ? "warning" : "default"}
                  label={isBlocked(selectedDate) ? "Blocked" : "Block day"}
                  onClick={() =>
                    onToggleBlockDate(
                      selectedDate.format("YYYY-MM-DD"),
                      !isBlocked(selectedDate)
                    )
                  }
                />
              )}
            </Stack>

            <DateCalendar
              value={selectedDate}
              onChange={(d) => setSelectedDate(d)}
              shouldDisableDate={shouldDisableDate}
            />
          </CardContent>
        </Card>

        {/* Slots */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              {dateTitle}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!selectedDate ? (
              <Alert severity="info">No date selected.</Alert>
            ) : slots.length === 0 ? (
              <Alert severity="info">No working hours defined.</Alert>
            ) : (
              <List>
                {slots.map(({ start, end, booked }) => {
                  const label = `${start.format("HH:mm")} – ${end.format(
                    "HH:mm"
                  )}`;
                  const secondary = booked
                    ? "Booked (tap to cancel)"
                    : onCreate
                    ? "Available (tap to book)"
                    : "Available";

                  const clickable =
                    (!!booked && !!onDelete) || (!booked && !!onCreate);

                  const handleClick = async () => {
                    if (booked && onDelete) {
                      await onDelete(booked.id);
                    } else if (!booked && onCreate) {
                      await onCreate(start.toISOString());
                    }
                  };

                  return (
                    <ListItem key={label} disablePadding sx={{ mb: 1 }}>
                      {clickable ? (
                        <ListItemButton
                          onClick={handleClick}
                          sx={{
                            bgcolor: booked ? "grey.200" : "success.light",
                            borderRadius: 1,
                          }}
                        >
                          <ListItemText primary={label} secondary={secondary} />
                        </ListItemButton>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            bgcolor: booked ? "grey.200" : "success.light",
                            borderRadius: 1,
                            px: 2,
                            py: 1,
                          }}
                        >
                          <ListItemText primary={label} secondary={secondary} />
                        </Box>
                      )}
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
