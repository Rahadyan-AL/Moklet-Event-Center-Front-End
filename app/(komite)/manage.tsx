// app/(komite)/manage.tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EventManageView from '../../components/event-manage/EventManageView';

export default function KomiteManageScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const targetEventId = Array.isArray(eventId) ? eventId[0] : eventId || '';
  return <EventManageView eventId={targetEventId} mode="komite" />;
}
