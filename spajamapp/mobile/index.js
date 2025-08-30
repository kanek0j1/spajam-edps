import React from 'react';
import { registerRootComponent } from 'expo';
import TaskListScreen from './TaskListScreen';  // ← ここを相対で

function App() {
  return <TaskListScreen />;
}

registerRootComponent(App);
