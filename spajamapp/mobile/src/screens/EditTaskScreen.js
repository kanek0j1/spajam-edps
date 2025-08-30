import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { listTasks, updateTask } from '../lib/tasksRepo';

export default function EditTaskScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // route.params は { id } か { task } のどちらでもOK
  const { id: paramId, task: paramTask } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [taskId, setTaskId] = useState(paramTask?.id ?? paramId ?? null);
  const [text, setText] = useState(paramTask?.text ?? '');
  const [severity, setSeverity] = useState(paramTask?.severity ?? 1);
  const [type, setType] = useState(paramTask?.type ?? '仕事');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      if (!paramTask && paramId) {
        const list = await listTasks();
        const found = list.find(t => t.id === paramId);
        if (!found) {
          Alert.alert('見つかりません', '対象のタスクが存在しません。');
          navigation.goBack();
          return;
        }
        setTaskId(found.id);
        setText(found.text);
        setSeverity(found.severity ?? 1);
        setType(found.type ?? '仕事');
      }
    } finally {
      setLoading(false);
    }
  }, [paramTask, paramId, navigation]);

  useEffect(() => { load(); }, [load]);

  const onSave = async () => {
    const t = (text ?? '').trim();
    if (!t) {
      Alert.alert('タイトルが空です', '入力してください。');
      return;
    }
    try {
      setSaving(true);
      await updateTask(taskId, { text: t, severity, type });
      navigation.goBack();
    } catch (e) {
      Alert.alert('保存に失敗しました', String(e));
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
        <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Icon name="chevron-left" size={28} color="#18181b" />
        </Pressable>
        <Text className="text-lg font-semibold">タスクを編集</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* タイトル */}
        <View className="mb-4">
          <Text className="text-xs text-zinc-500 mb-1">タイトル</Text>
          <TextInput
            className="border border-zinc-300 rounded-lg px-3 py-2"
            value={text}
            onChangeText={setText}
            placeholder="タイトルを入力"
          />
        </View>

        {/* 重要度 */}
        <View className="mb-4">
          <Text className="text-xs text-zinc-500 mb-2">重要度</Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4].map((lvl) => (
              <Pressable
                key={lvl}
                onPress={() => setSeverity(lvl)}
                className={`px-3 py-2 rounded-full ${severity === lvl ? 'bg-blue-600' : 'bg-zinc-200'}`}
              >
                <Text className={`${severity === lvl ? 'text-white' : 'text-zinc-800'}`}>{lvl}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* カテゴリ */}
        <View className="mb-6">
          <Text className="text-xs text-zinc-500 mb-2">カテゴリ</Text>
          <View className="flex-row gap-2">
            {['仕事','遊び'].map(tp => (
              <Pressable
                key={tp}
                onPress={() => setType(tp)}
                className={`px-3 py-2 rounded-full ${
                  type === tp ? (tp === '仕事' ? 'bg-blue-600' : 'bg-emerald-600') : 'bg-zinc-200'
                }`}
              >
                <Text className={`${type === tp ? 'text-white' : 'text-zinc-800'}`}>{tp}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* アクション */}
        <View className="flex-row justify-end gap-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="px-4 py-3 rounded-lg bg-zinc-200"
            disabled={saving}
          >
            <Text className="text-zinc-800">キャンセル</Text>
          </Pressable>
          <Pressable
            onPress={onSave}
            className={`px-4 py-3 rounded-lg ${saving ? 'bg-blue-300' : 'bg-blue-600'}`}
            disabled={saving}
          >
            <Text className="text-white font-semibold">{saving ? '保存中…' : '保存'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
