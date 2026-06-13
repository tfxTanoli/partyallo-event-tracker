import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Palette } from '../constants/colors';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { FontSize, FontWeight, Shadow } from '../constants/theme';
import { RootTabParamList, EventsStackParamList, CatalogStackParamList, PackingStackParamList } from '../types';

// Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { EventsListScreen } from '../screens/events/EventsListScreen';
import { EventFormScreen } from '../screens/events/EventFormScreen';
import { CatalogListScreen } from '../screens/catalog/CatalogListScreen';
import { StationFormScreen } from '../screens/catalog/StationFormScreen';
import { PackingHomeScreen } from '../screens/packing/PackingHomeScreen';
import { StationSelectorScreen } from '../screens/packing/StationSelectorScreen';
import { PackingChecklistScreen } from '../screens/packing/PackingChecklistScreen';
import { PurchasesScreen } from '../screens/purchases/PurchasesScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

// ─── Stack navigators ─────────────────────────────────────────────────────────

const EventsStack = createNativeStackNavigator<EventsStackParamList>();
function EventsNavigator() {
  return (
    <EventsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <EventsStack.Screen name="EventsList" component={EventsListScreen} />
      <EventsStack.Screen name="EventForm" component={EventFormScreen} />
    </EventsStack.Navigator>
  );
}

const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();
function CatalogNavigator() {
  return (
    <CatalogStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <CatalogStack.Screen name="CatalogList" component={CatalogListScreen} />
      <CatalogStack.Screen name="StationForm" component={StationFormScreen} />
    </CatalogStack.Navigator>
  );
}

const PackingStack = createNativeStackNavigator<PackingStackParamList>();
function PackingNavigator() {
  return (
    <PackingStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <PackingStack.Screen name="PackingHome" component={PackingHomeScreen} />
      <PackingStack.Screen name="StationSelector" component={StationSelectorScreen} />
      <PackingStack.Screen name="PackingChecklist" component={PackingChecklistScreen} />
    </PackingStack.Navigator>
  );
}

// ─── Tab navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabConfigEntry = {
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
};

const makeTabConfig = (Colors: Palette): Record<string, TabConfigEntry> => ({
  Dashboard: {
    active: 'home',
    inactive: 'home-outline',
    label: 'Home',
    color: Colors.primary[600],
  },
  Events: {
    active: 'calendar',
    inactive: 'calendar-outline',
    label: 'Events',
    color: Colors.sky[600],
  },
  Catalog: {
    active: 'storefront',
    inactive: 'storefront-outline',
    label: 'Catalog',
    color: Colors.violet[600],
  },
  Packing: {
    active: 'cube',
    inactive: 'cube-outline',
    label: 'Packing',
    color: Colors.amber[600],
  },
  Purchases: {
    active: 'cart',
    inactive: 'cart-outline',
    label: 'Purchases',
    color: Colors.emerald[600],
  },
  Settings: {
    active: 'settings',
    inactive: 'settings-outline',
    label: 'Settings',
    color: Colors.primary[600],
  },
});

export function AppNavigator() {
  const { colors: Colors } = useTheme();
  const TAB_CONFIG = makeTabConfig(Colors);
  const tabStyles = useThemedStyles(makeTabStyles);
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const cfg = TAB_CONFIG[route.name];
          return {
            headerShown: false,
            tabBarIcon: ({ focused, size }) => {
              const iconName = focused ? cfg.active : cfg.inactive;
              return (
                <View style={[tabStyles.iconWrap, focused && { backgroundColor: cfg.color + '18' }]}>
                  <Ionicons
                    name={iconName}
                    size={22}
                    color={focused ? cfg.color : Colors.slate[400]}
                  />
                </View>
              );
            },
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  tabStyles.label,
                  { color: focused ? cfg.color : Colors.slate[400] },
                  focused && tabStyles.labelActive,
                ]}
              >
                {cfg.label}
              </Text>
            ),
            tabBarStyle: tabStyles.tabBar,
            tabBarItemStyle: tabStyles.tabItem,
          };
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Events" component={EventsNavigator} />
        <Tab.Screen name="Catalog" component={CatalogNavigator} />
        <Tab.Screen name="Packing" component={PackingNavigator} />
        <Tab.Screen name="Purchases" component={PurchasesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const makeTabStyles = (Colors: Palette) => StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
    height: Platform.OS === 'ios' ? 84 : 64,
    ...Shadow.md,
  },
  tabItem: {
    paddingTop: 4,
    flex: 1,
  },
  iconWrap: {
    width: 46,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    marginTop: 0,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
  labelActive: {
    fontWeight: FontWeight.bold,
  },
});
