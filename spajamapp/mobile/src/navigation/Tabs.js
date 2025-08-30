import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskListScreen from '../screens/TaskListScreen';
import ManualScreen from '../screens/ManualScreen';


const Tab = createBottomTabNavigator();

function MyTabs() {
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
