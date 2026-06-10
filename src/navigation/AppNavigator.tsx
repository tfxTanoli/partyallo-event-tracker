import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/colors';
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

// ─── Stack navigators ────────────────────────────────────────────────────────

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

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  Events: { active: 'calendar', inactive: 'calendar-outline' },
  Catalog: { active: 'storefront', inactive: 'storefront-outline' },
  Packing: { active: 'cube', inactive: 'cube-outline' },
  Purchases: { active: 'cart', inactive: 'cart-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Dashboard: 'Dashboard',
  Events: 'Events',
  Catalog: 'Catalog',
  Packing: 'Packing',
  Purchases: 'Purchases',
};

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.active : icons.inactive;
            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarLabel: ({ focused, color }) => (
            <Text style={[tabStyles.label, { color }]}>
              {TAB_LABELS[route.name]}
            </Text>
          ),
          tabBarActiveTintColor: Colors.primary[600],
          tabBarInactiveTintColor: Colors.slate[400],
          tabBarStyle: tabStyles.tabBar,
          tabBarItemStyle: tabStyles.tabItem,
          tabBarActiveBackgroundColor: Colors.primary[50],
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Events" component={EventsNavigator} />
        <Tab.Screen name="Catalog" component={CatalogNavigator} />
        <Tab.Screen name="Packing" component={PackingNavigator} />
        <Tab.Screen name="Purchases" component={PurchasesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
    height: Platform.OS === 'ios' ? 82 : 62,
    ...Shadow.md,
  },
  tabItem: {
    borderRadius: 12,
    margin: 4,
    paddingTop: 4,
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    marginTop: 1,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
});
