// src/navigation/Tabs.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskListScreen from '../screens/TaskListScreen';
import ManualScreen from '../screens/ManualScreen';
import EditTaskScreen from '../screens/EditTaskScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // 4個のタブだけを表示（幅は自動で100%に等配分される）
        tabBarIcon: ({ color, size }) => {
          const icons = {
            ホーム: 'home',
            記録: 'pencil',
            タスク: 'file-document-outline',
            マニュアル: 'information',
          };
          return <Icon name={icons[route.name]} color={color} size={size} />;
        },
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name="ホーム" component={HomeScreen} />
      <Tab.Screen name="記録" component={AddTaskScreen} />
      <Tab.Screen name="タスク" component={TaskListScreen} />
      <Tab.Screen name="マニュアル" component={ManualScreen} />
    </Tab.Navigator>
  );
}

export default function Tabs() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* ルートはタブ一式。ここでは常に4タブが表示される */}
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        {/* 編集はタブ外のスタック画面（プッシュ表示・タブは隠れる） */}
        <Stack.Screen
          name="編集"
          component={EditTaskScreen}
          options={{
            title: 'タスクを編集',
            presentation: 'modal', // 好みで 'card' に
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
