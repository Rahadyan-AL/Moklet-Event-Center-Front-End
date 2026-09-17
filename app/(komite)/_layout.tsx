// app/(komite)/_layout.tsx
// Area khusus EventCommitteeMember (akun SISWA yang ditempatkan di event).
// Sengaja TERPISAH dari grup (panitia): committee tidak pernah masuk ke
// tab-bar/dashboard panitia, jadi tidak ada lagi bug "tiba-tiba tampilan
// panitia / balik aneh" akibat push lintas grup.
import React from 'react';
import { Stack } from 'expo-router';
import { RoleGuard } from '../../components/RoleGuard';

export default function KomiteLayout() {
  return (
    <RoleGuard allowedRoles={['SISWA']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="manage" />
        <Stack.Screen name="edit" />
        <Stack.Screen name="category-form" />
        <Stack.Screen name="schedule-form" />
      </Stack>
    </RoleGuard>
  );
}
