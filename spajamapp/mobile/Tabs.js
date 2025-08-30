import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function HomeScreen() {
  const [workPct] = useState(60);
  const [playPct] = useState(40);
  const total = Math.max(1, workPct + playPct);
  const workRatio = workPct / total;
  const playRatio = playPct / total;

  return (
    <View className="flex-1 items-center justify-center bg-white">


      <View className="w-64 h-8 flex-row rounded-lg border border-neutral-400 overflow-hidden bg-neutral-200">
        <View className="h-full bg-blue-500" style={{ flex: workRatio }} />
        <View className="h-full bg-orange-400" style={{ flex: playRatio }} />
      </View>

      <View className="w-64 mt-2 flex-row justify-between">
        <Text className="text-sm">仕事: 30g</Text>
        <Text className="text-sm">遊び: 20g</Text>
      </View>
    </View>
  );
}



function RecordScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Record!</Text>
    </View>
  );
}

function TaskScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Task!</Text>
    </View>
  );
}

function ManualScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Manual!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            ホーム: 'home',
            記録: 'pencil',
            タスク: 'file-document-outline',
            マニュアル: 'information'
          };

          return (
            <Icon
              name={icons[route.name]}
              color={color}
              size={size}
            />
          );
        },
      })}
    >
      <Tab.Screen name='ホーム' component={HomeScreen} />
      <Tab.Screen name='記録' component={RecordScreen} />
      <Tab.Screen name='タスク' component={TaskScreen} />
      <Tab.Screen name='マニュアル' component={ManualScreen} />
    </Tab.Navigator>
  );
}

export default function Tabs() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
