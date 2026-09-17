// app/(komite)/edit.tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EventEditForm from '../../components/event-manage/EventEditForm';

export default function KomiteEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const eventId = Array.isArray(id) ? id[0] : id || '';
  return <EventEditForm eventId={eventId} />;
}
