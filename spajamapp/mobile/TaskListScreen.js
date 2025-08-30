// TaskListScreen.js
import React from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable } from 'react-native';

// 表示専用スクリーン
// - tasks: [{ id, title, priority:1-5, category:'遊び'|'仕事' }]
// - onBack: 戻るハンドラ（未指定なら navigation.goBack() を試行）
export default function TaskListScreen({ route, navigation, tasks, onBack }) {
  const list = tasks ?? route?.params?.tasks ?? []; // どれかで受け取る

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ヘッダー（大きめ＆下げる） */}
      <View className="items-center pt-10 pb-4">
        <Text className="text-2xl font-semibold">タスク一覧</Text>
      </View>

      {/* リスト（左=タイトル / 中央=重要度 / 右=カテゴリ） */}
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-px bg-zinc-200 ml-4" />}
        contentContainerStyle={{ paddingBottom: 112 }} // フッター分の余白
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
            {/* 中央：重要度 */}
            <View className="w-14 items-center">
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
                  (item.category === '仕事'
                    ? 'bg-blue-100'
                    : 'bg-emerald-100')
                }
              >
                <Text
                  className={
                    'text-xs font-medium ' +
                    (item.category === '仕事'
                      ? 'text-blue-700'
                      : 'text-emerald-700')
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
