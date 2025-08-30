// TaskListScreen.js
import React from 'react';
import { SafeAreaView, View, Text, FlatList } from 'react-native';

export default function TaskListScreen({ route, navigation, tasks, onBack }) {
  const list = tasks ?? route?.params?.tasks ?? [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 画面タイトル：少し下げる */}
      <View className="items-center pt-16 pb-6">
        <Text className="text-2xl font-semibold">タスク一覧</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        // 列ヘッダー（sticky）
        ListHeaderComponent={
          <View className="px-4 py-2 bg-zinc-50 border-y border-zinc-200">
            <View className="flex-row items-center">
              <Text className="flex-1 text-xs text-zinc-500">タイトル</Text>
              <Text className="w-24 text-xs text-zinc-500 text-center">重要度</Text>
              <Text className="w-20 text-xs text-zinc-500 text-right">カテゴリ</Text>
            </View>
          </View>
        }
        stickyHeaderIndices={[0]} // ← ヘッダーを固定。固定したくなければ削除
        ItemSeparatorComponent={() => <View className="h-px bg-zinc-200 ml-4" />}
        contentContainerStyle={{ paddingBottom: 112 }}
        ListEmptyComponent={
          <View className="px-4 py-12 items-center">
            <Text className="text-zinc-500">タスクがありません。</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-4 py-3 flex-row items-center">
            {/* 左：タイトル */}
            <Text className="flex-1 text-base text-zinc-900" numberOfLines={1}>
              {item.title}
            </Text>

            {/* 中央：重要度（明示） */}
            <View className="w-24 items-center">
              <View className="px-2 py-1 rounded-full bg-amber-100">
                <Text className="text-xs font-semibold text-amber-700">
                  {item.priority}
                </Text>
              </View>
            </View>

            {/* 右：カテゴリ */}
            <View className="w-20 items-end">
              <View
                className={
                  'px-2 py-1 rounded-full ' +
                  (item.category === '仕事' ? 'bg-blue-100' : 'bg-emerald-100')
                }
              >
                <Text
                  className={
                    'text-xs font-medium ' +
                    (item.category === '仕事' ? 'text-blue-700' : 'text-emerald-700')
                  }
                >
                  {item.category}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
