import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



export default function HomeScreen() {
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
