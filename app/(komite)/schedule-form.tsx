// app/(komite)/schedule-form.tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ScheduleForm from '../../components/event-manage/ScheduleForm';

export default function KomiteScheduleFormScreen() {
  const { eventId, scheduleId } = useLocalSearchParams<{ eventId?: string; scheduleId?: string }>();
  return (
    <ScheduleForm
      targetEventId={Array.isArray(eventId) ? eventId[0] : eventId || ''}
      targetSchId={Array.isArray(scheduleId) ? scheduleId[0] : scheduleId}
    />
  );
}
