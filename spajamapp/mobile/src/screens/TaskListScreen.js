// src/screens/TaskListScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,              // ← 追加
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listTasks, clearAllTasks, saveTasks  } from '../lib/tasksRepo';

export default function TaskListScreen({ tasks: list, setTasks: setList }) {
  // const [list, setList] = useState([]);
  // const [refreshing, setRefreshing] = useState(false);

  // const load = useCallback(async () => {
  //   const data = await listTasks();
  //   setList(data);
  // }, []);

  // useEffect(() => { load(); }, [load]);
  // useFocusEffect(useCallback(() => { load(); }, [load]));

  // const onRefresh = useCallback(async () => {
  //   setRefreshing(true);
  //   await load();
  //   setRefreshing(false);
  // }, [load]);

  // ← ここが「確認アラート付き 全削除」
  const confirmResetAll = useCallback(() => {
    if (list.length === 0) return; // 空なら何もしない（任意）
    Alert.alert(
      '全削除の確認',
      '本当にすべてのタスクを削除しますか？この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            await clearAllTasks();
            setList([]);
          },
        },
      ],
      { cancelable: true }
    );
  }, [list.length, setList]);

  const renderItem = ({ item }) => (
    <View className="px-4 py-3 flex-row items-center">
      <Text
        className={`flex-1 text-base ${item.done ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <View className="w-24 items-center">
        <View className="px-2 py-1 rounded-full bg-amber-100">
          <Text className="text-xs font-semibold text-amber-700">{item.priority}</Text>
        </View>
      </View>
      <View className="w-20 items-end">
        <View className={'px-2 py-1 rounded-full ' + (item.type === '仕事' ? 'bg-blue-100' : 'bg-emerald-100')}>
          <Text className={'text-xs font-medium ' + (item.type === '仕事' ? 'text-blue-700' : 'text-emerald-700')}>
            {item.type}
          </Text>
        </View>
      </View>
    </View>
  );

  const resetDisabled = list.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between pt-16 pb-6 px-4">
        <Text className="text-2xl font-semibold">タスク一覧</Text>
        <TouchableOpacity
          disabled={resetDisabled}
          onPress={confirmResetAll}
          className={`px-3 py-2 rounded-full ${resetDisabled ? 'bg-red-50' : 'bg-red-100'}`}
        >
          <Text className={`text-xs font-semibold ${resetDisabled ? 'text-red-300' : 'text-red-600'}`}>
            全削除
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View className="px-4 py-2 bg-zinc-50 border-y border-zinc-200">
            <View className="flex-row items-center">
              <Text className="flex-1 text-xs text-zinc-500">タイトル</Text>
              <Text className="w-24 text-xs text-zinc-500 text-center">重要度</Text>
              <Text className="w-20 text-xs text-zinc-500 text-right">カテゴリ</Text>
            </View>
          </View>
        }
        stickyHeaderIndices={[0]}
        ItemSeparatorComponent={() => <View className="h-px bg-zinc-200 ml-4" />}
        contentContainerStyle={{ paddingBottom: 112 }}
        ListEmptyComponent={
          <View className="px-4 py-12 items-center">
            <Text className="text-zinc-500">タスクがありません。</Text>
          </View>
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}
