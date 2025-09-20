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

export interface Appointment {
  id: number;
  patient: number;
  dietician: number;
  date_time: string;
  is_active?: boolean;
  is_approved?: boolean;
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
  onConfirm?: (id: number) => Promise<void> | void;
  onToggleBlockDate?: (date: string, block: boolean) => void;
  patientLookup?: (patientId: number) => string | undefined;
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  role = "patient",
  appointments,
  workingDays = [false, true, true, true, true, true, false],
  workingHours = { startHour: 9, endHour: 17, slotMinutes: 60 },
  blockedDates = [],
  onCreate,
  onDelete,
  onConfirm,
  onToggleBlockDate,
  patientLookup,
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
    if (date.isBefore(dayjs().startOf("day"))) return true;
    if (!isWorkingDay(date)) return true;
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

    const list: { start: Dayjs; end: Dayjs; booked?: Appointment }[] = [];

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
      const k = `${t.hour()}:${t.minute()}`;
      list.push({
        start: t.clone(),
        end: t.clone().add(slotMinutes, "minute"),
        booked: bookedMap.get(k),
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

                  let secondary = "Available";
                  let clickable = false;
                  let bgcolor: string | undefined = "success.light";
                  let onClick: (() => void) | undefined;

                  if (booked) {
                    const approved = booked.is_approved === true;
                    const who = patientLookup?.(booked.patient);

                    if (approved) {
                      secondary = `Booked${
                        who ? ` • ${who}` : ""
                      } (tap to cancel)`;
                      bgcolor = "grey.200";
                      if (onDelete) {
                        clickable = true;
                        onClick = () => onDelete(booked.id);
                      }
                    } else {
                      if (role === "dietitian") {
                        secondary = `Pending${
                          who ? ` • ${who}` : ""
                        } (tap to confirm or cancel)`;
                        bgcolor = "#ffa726";
                        if (onConfirm || onDelete) {
                          clickable = true;
                          onClick = async () => {
                            if (onConfirm && onDelete) {
                              const ok = window.confirm(
                                "Confirm this appointment? Click OK to confirm, Cancel to cancel it."
                              );
                              if (ok) await onConfirm(booked.id);
                              else await onDelete(booked.id);
                            } else if (onConfirm) {
                              await onConfirm(booked.id);
                            } else if (onDelete) {
                              await onDelete(booked.id);
                            }
                          };
                        }
                      } else {
                        secondary = "Pending (tap to cancel)";
                        bgcolor = "#ffa726";
                        if (onDelete) {
                          clickable = true;
                          onClick = () => onDelete(booked.id);
                        }
                      }
                    }
                  } else if (onCreate) {
                    secondary = "Available (tap to book)";
                    clickable = true;
                    onClick = () => onCreate(start.toISOString());
                  }

                  return (
                    <ListItem key={label} disablePadding>
                      {clickable ? (
                        <ListItemButton
                          onClick={onClick}
                          sx={{ bgcolor, mb: 1, borderRadius: 1 }}
                        >
                          <ListItemText primary={label} secondary={secondary} />
                        </ListItemButton>
                      ) : (
                        <Box
                          sx={{
                            bgcolor,
                            mb: 1,
                            borderRadius: 1,
                            px: 2,
                            py: 1.25,
                            width: 1,
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
