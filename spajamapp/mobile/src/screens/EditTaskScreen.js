import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function EditTaskScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, task: paramTask, onTaskUpdated } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [taskId, setTaskId] = useState(paramTask?.id ?? id ?? null);
  const [title, setTitle] = useState(paramTask?.title ?? '');
  const [priority, setPriority] = useState(paramTask?.priority ?? 1); // 1..10
  const [type, setType] = useState(paramTask?.type ?? '仕事');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!paramTask || !taskId) {
      Alert.alert('エラー', '編集対象のタスク情報が見つかりません。');
      navigation.goBack();
      return;
    }
    setLoading(false);
  }, [paramTask, taskId, navigation]);

  const onCancel = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSave = async () => {
    Keyboard.dismiss();
    const t = (title ?? '').trim();
    if (!t) {
      Alert.alert('タイトルが空です', '入力してください。');
      return;
    }
    try {
      setSaving(true);
      const patch = { id: taskId, title: t, priority, type };

      // route.paramsからcallbackを取得して実行
      if (onTaskUpdated) {
        onTaskUpdated(patch);
      }

      // 画面を閉じる
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={onCancel} className="p-2 -ml-2" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="chevron-left" size={28} color="#18181b" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">タスクを編集</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* タイトル */}
        <View className="mb-4">
          <Text className="text-xs text-zinc-500 mb-1">タイトル</Text>
          <TextInput
            className="border border-zinc-300 rounded-lg px-3 py-2"
            value={title}
            onChangeText={setTitle}
            placeholder="タイトルを入力"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        {/* 重要度 1..10 */}
        <View className="mb-4">
          <Text className="text-xs text-zinc-500 mb-2">重要度（1〜10）</Text>
          <View className="flex-row flex-wrap gap-2">
            {[1,2,3,4,5,6,7,8,9,10].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                onPress={() => setPriority(lvl)}
                className={`px-3 py-2 rounded-full ${priority === lvl ? 'bg-blue-600' : 'bg-zinc-200'}`}
                activeOpacity={0.7}
              >
                <Text className={`${priority === lvl ? 'text-white' : 'text-zinc-800'}`}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* カテゴリ */}
        <View className="mb-6">
          <Text className="text-xs text-zinc-500 mb-2">カテゴリ</Text>
          <View className="flex-row gap-2">
            {['仕事','遊び'].map(tp => (
              <TouchableOpacity
                key={tp}
                onPress={() => setType(tp)}
                className={`px-3 py-2 rounded-full ${
                  type === tp ? (tp === '仕事' ? 'bg-blue-600' : 'bg-emerald-600') : 'bg-zinc-200'
                }`}
                activeOpacity={0.7}
              >
                <Text className={`${type === tp ? 'text-white' : 'text-zinc-800'}`}>{tp}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* アクション */}
        <View className="flex-row justify-end gap-3">
          <TouchableOpacity
            onPress={onCancel}
            className="px-4 py-3 rounded-lg bg-zinc-200"
            disabled={saving}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text className="text-zinc-800">キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            className={`px-4 py-3 rounded-lg ${saving ? 'bg-blue-300' : 'bg-blue-600'}`}
            disabled={saving}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">{saving ? '保存中…' : '保存'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}