// src/navigation/Tabs.js
import React, { useState , useEffect} from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskListScreen from '../screens/TaskListScreen';
import ManualScreen from '../screens/ManualScreen';

import EditTaskScreen from '../screens/EditTaskScreen';




const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// AsyncStorageに保存する際のキー
const HAS_LAUNCHED_KEY = '@hasLaunched';



function MainTabs() {
  const [tasks, setTasks] = useState([]);
  const handleAddTask = (newTask) => {
    const newTasks = [
      ...tasks,
      { id: Date.now().toString(), ...newTask }
    ];
    setTasks(newTasks);
    // await saveTasks(newTasks);
    alert('タスクを追加しました！');
  };


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

      <Tab.Screen name='ホーム'>
        {() => <HomeScreen tasks={tasks} setTasks={setTasks} />}
      </Tab.Screen>
      <Tab.Screen name='記録'>
        {() => <AddTaskScreen onAdd={handleAddTask} />}
      </Tab.Screen>

      <Tab.Screen name='タスク'>
        {() => <TaskListScreen tasks={tasks} setTasks={setTasks} />}
      </Tab.Screen>
      <Tab.Screen name='マニュアル' component={ManualScreen} />
    </Tab.Navigator>
  );
}

export default function Tabs() {
  const [hasLaunched, setHasLaunched] = useState(null); // null: チェック中, false: 初回, true: 2回目以降

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem(HAS_LAUNCHED_KEY);
        if (value === null) {
          setHasLaunched(false); // 初回起動
        } else {
          setHasLaunched(true); // 2回目以降の起動
        }
      } catch (error) {
        console.error("Failed to load launch status.", error);
        setHasLaunched(false); // エラー時は初回起動として扱う
      }
    };

    checkFirstLaunch();
  }, []);
  
  // ストレージのチェックが終わるまで何も表示しない（画面のちらつき防止）
  if (hasLaunched === null) {
    return <View />; // またはローディングスピナーなどを表示
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        // 初回起動かどうかに基づいて、最初に表示する画面を決定
        initialRouteName={hasLaunched ? 'Main' : 'Manual'}
        // StackNavigator自身のヘッダーは不要なので非表示に
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Manual" component={ManualScreen} />
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

