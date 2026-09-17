// app/(admin)/_layout.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { RoleGuard } from '../../components/RoleGuard';

const ADMIN_TABS = [
  { name: 'dashboard', label: 'Beranda', icon: 'home-outline' as const, iconActive: 'home' as const },
  { name: 'siswa', label: 'Siswa', icon: 'people-outline' as const, iconActive: 'people' as const },
  { name: 'panitia', label: 'Panitia', icon: 'person-add-outline' as const, iconActive: 'person-add' as const },
  { name: 'akademik', label: 'Akademik', icon: 'school-outline' as const, iconActive: 'school' as const },
];

function AdminTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 10);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route: any, index: number) => {
        const tab = ADMIN_TABS.find((t) => t.name === route.name);
        if (!tab) return null;
        const isActive = state.index === index;
        const onPress = () => {
          if (isActive) return;
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isActive ? { selected: true } : {}}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.85}
          >
            {isActive ? (
              <View style={styles.activePill}>
                <Ionicons name={tab.iconActive} size={18} color="#fff" />
                <Text style={styles.activePillText}>{tab.label}</Text>
              </View>
              ) : (
                <View style={styles.inactiveTab}>
                  <Ionicons name={tab.icon} size={20} color="#64748B" />
                  <Text style={styles.inactiveTabText}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  export default function AdminLayout() {
    return (
      <RoleGuard allowedRoles={['ADMIN_KESISWAAN']}>
        <Tabs
          screenOptions={{ headerShown: false }}
          tabBar={(props) => <AdminTabBar {...props} />}
        >
          <Tabs.Screen name="dashboard" options={{ title: 'Beranda' }} />
          <Tabs.Screen name="siswa" options={{ title: 'Siswa' }} />
          <Tabs.Screen name="panitia" options={{ title: 'Panitia' }} />
          <Tabs.Screen name="akademik" options={{ title: 'Akademik' }} />
        </Tabs>
      </RoleGuard>
    );
  }

  const styles = StyleSheet.create({
    tabBarContainer: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 1,
      borderTopColor: Colors.divider,
      paddingTop: 8,
      paddingHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 8,
    },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  activePill: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  activePillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  inactiveTab: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTabText: {
    color: '#8E9BAE',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
