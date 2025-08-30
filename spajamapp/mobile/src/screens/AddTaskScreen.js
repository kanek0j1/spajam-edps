import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tasks';

function AddTaskScreen() {
  const [text, setText] = useState('');
  const [severity, setSeverity] = useState(1);

  const handlePress = async (type) => {
    const t = text.trim();
    if (!t) return;

    const newItem = {
      id: Date.now().toString(),   // とりあえず時刻ベース
      text: t,
      type,                        // '遊び' or '仕事'
      severity,                    // 1..4
      done: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newItem); // 先頭に追加
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // リセット
      setText('');
      setSeverity(1);
      // Alert.alert('保存', 'タスクを追加しました'); // 任意
      console.log('保存OK: 件数', list.length);
    } catch (e) {
      console.error('保存失敗', e);
      Alert.alert('保存に失敗しました', String(e));
    }
  };

  return (
    <View className="absolute left-4 bottom-20 w-[90%] px-4 pb-6">
      <Text className="font-bold text-2xl text-center mb-[40%]">タスク追加</Text>

      {text.trim() !== '' && (
        <View className="mb-4">
          <Text className="text-gray-500 text-sm">追加タスク</Text>
          <Text className="text-gray-800 text-2xl font-bold">{text}</Text>
        </View>
      )}

      <View className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 mb-4">
        <Text className="text-gray-800 text-base">追加タスク名を入れる</Text>
        <View className="w-full h-px bg-gray-300 my-2" />
        <TextInput
          placeholder="例）友達とカラオケ"
          value={text}
          onChangeText={setText}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="w-full mb-6">
        <Text className="text-gray-500 text-base mb-3">重要度</Text>
        <View className="flex-row justify-around">
          {[1, 2, 3, 4].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setSeverity(level)}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                severity === level ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <Text className={`font-bold text-lg ${
                severity === level ? 'text-white' : 'text-gray-800'
              }`}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="w-full bg-orange-400 justify-center items-center py-4 rounded-full mb-3"
        onPress={() => handlePress('遊び')}
      >
        <Text className="text-white font-bold text-lg">遊び追加</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full bg-blue-500 justify-center items-center py-4 rounded-full"
        onPress={() => handlePress('仕事')}
      >
        <Text className="text-white font-bold text-lg">仕事追加</Text>
      </TouchableOpacity>
    </View>
  );
}

export default AddTaskScreen;
