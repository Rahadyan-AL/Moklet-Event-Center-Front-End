// app/(panitia)/_layout.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { RoleGuard } from "../../components/RoleGuard";

const PANITIA_TABS = [
  {
    name: "dashboard",
    label: "Beranda",
    iconActive: "home" as const,
    iconInactive: "home-outline" as const,
  },
  {
    name: "events/index",
    label: "Event",
    iconActive: "calendar" as const,
    iconInactive: "calendar-outline" as const,
  },
  {
    name: "announcements",
    label: "Info",
    iconActive: "notifications" as const,
    iconInactive: "notifications-outline" as const,
  },
  {
    name: "history",
    label: "Riwayat",
    iconActive: "time" as const,
    iconInactive: "time-outline" as const,
  },
];

function PanitiaTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === "ios" ? 16 : 10);

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabBarContent}>
        {PANITIA_TABS.map((item) => {
          const routeIndex = state.routes.findIndex((r: any) => r.name === item.name);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            if (routeIndex !== -1) {
              const route = state.routes[routeIndex];
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }
          };

          return (
            <TouchableOpacity
              key={item.name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              style={[
                styles.tabItem,
              ]}
              onPress={onPress}
              activeOpacity={0.85}
            >
              {isFocused ? (
                <View style={styles.activePill}>
                  <Ionicons name={item.iconActive} size={18} color="#FFFFFF" />
                  <Text style={styles.activePillText}>{item.label}</Text>
                </View>
              ) : (
                <View style={styles.inactiveIconWrapper}>
                  <Ionicons name={item.iconInactive} size={20} color="#64748B" />
                  <Text style={styles.inactiveLabel}>{item.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function PanitiaLayout() {
  return (
    // Grup panitia khusus PANITIA/ADMIN. Committee (SISWA) punya area
    // sendiri di (komite) -- mereka tidak pernah butuh masuk ke sini, dan
    // memblokirnya menghilangkan seluruh kelas bug "lintas area".
    <RoleGuard allowedRoles={["PANITIA", "ADMIN_KESISWAAN"]}>
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <PanitiaTabBar {...props} />}>
        <Tabs.Screen name="dashboard" options={{ title: "Beranda" }} />
        <Tabs.Screen name="events/index" options={{ title: "Event" }} />
        <Tabs.Screen name="announcements" options={{ title: "Info" }} />
        <Tabs.Screen name="history" options={{ title: "Riwayat" }} />
      </Tabs>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  tabBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  inactiveIconWrapper: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveLabel: {
    color: '#8E9BAE',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
