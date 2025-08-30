// index.js（テスト用）
import React from 'react';
import { registerRootComponent } from 'expo';
import TaskListScreen from './src/screens/TaskListScreen';
import Tabs from './src/navigation/Tabs';

registerRootComponent(Tabs);
