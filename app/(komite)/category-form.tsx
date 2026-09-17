// app/(komite)/category-form.tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import CategoryForm from '../../components/event-manage/CategoryForm';

export default function KomiteCategoryFormScreen() {
  const { eventId, categoryId } = useLocalSearchParams<{ eventId?: string; categoryId?: string }>();
  return (
    <CategoryForm
      targetEventId={Array.isArray(eventId) ? eventId[0] : eventId || ''}
      targetCatId={Array.isArray(categoryId) ? categoryId[0] : categoryId}
    />
  );
}
