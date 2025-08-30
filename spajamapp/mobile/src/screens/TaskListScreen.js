import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { clearAllTasks, removeTask } from '../lib/tasksRepo';

export default function TaskListScreen({ tasks: list, setTasks: setList }) {
  const navigation = useNavigation();

  const COL = { sev: 55, cat: 64, act: 64 };

  const confirmResetAll = React.useCallback(() => {
    if (!list || list.length === 0) return;
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
  }, [list, setList]);

  const confirmRemoveOne = React.useCallback((id) => {
    Alert.alert('削除しますか？', 'このタスクを削除します。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await removeTask(id);
          setList(cur => cur.filter(t => t.id !== id));
        },
      },
    ]);
  }, [setList]);

  const handleEditTask = React.useCallback((item) => {
    navigation.getParent()?.navigate('編集', { 
      id: item.id, 
      task: item,
      onTaskUpdated: (updatedTask) => {
        setList(cur => cur.map(t => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)));
      }
    });
  }, [navigation, setList]);

  const renderItem = ({ item }) => (
    <View className="px-4 py-3 flex-row items-center">
      {/* タイトルは押せない（編集はペンのみ） */}
      <Text className="flex-1 pr-3 text-base text-zinc-900" numberOfLines={1}>
        {item.title}
      </Text>

      {/* 重要度（固定幅） */}
      <View style={{ width: COL.sev }} className="items-center">
        <View className="px-2 py-1 rounded-full bg-amber-100">
          <Text className="text-xs font-semibold text-amber-700">
            {item.priority}
          </Text>
        </View>
      </View>

      {/* カテゴリ（固定幅） */}
      <View style={{ width: COL.cat }} className="items-center">
        <View
          className={
            'px-2 py-1 rounded-full ' +
            (item.type === '仕事' ? 'bg-blue-100' : 'bg-emerald-100')
          }
        >
          <Text
            className={
              'text-xs font-medium ' +
              (item.type === '仕事' ? 'text-blue-700' : 'text-emerald-700')
            }
          >
            {item.type}
          </Text>
        </View>
      </View>

      {/* 操作（右端／ペンのみ編集） */}
      <View style={{ width: COL.act }} className="flex-row justify-end items-center gap-2">
        <Pressable
          onPress={() => handleEditTask(item)}
          className="p-1"
          accessibilityLabel="編集"
        >
          <Icon name="pencil" size={18} color="#525252" />
        </Pressable>
        <Pressable
          onPress={() => confirmRemoveOne(item.id)}
          className="p-1"
          accessibilityLabel="削除"
        >
          <Icon name="trash-can-outline" size={18} color="#dc2626" />
        </Pressable>
      </View>
    </View>
  );

  const resetDisabled = !list || list.length === 0;

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
        ListHeaderComponent={
          <View className="px-4 py-2 bg-zinc-50 border-y border-zinc-200">
            <View className="flex-row items-center">
              <Text className="flex-1 text-xs text-zinc-500">タイトル</Text>
              <Text style={{ width: COL.sev }} className="text-xs text-zinc-500 text-center">重要度</Text>
              <Text style={{ width: COL.cat }} className="text-xs text-zinc-500 text-center">カテゴリ</Text>
              <Text style={{ width: COL.act }} className="text-xs text-zinc-500 text-right">操作</Text>
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