// app/(panitia)/events/[id]/index.tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EventManageView from '../../../../components/event-manage/EventManageView';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const eventId = Array.isArray(id) ? id[0] : id || '';
  return <EventManageView eventId={eventId} mode="panitia" />;
}
