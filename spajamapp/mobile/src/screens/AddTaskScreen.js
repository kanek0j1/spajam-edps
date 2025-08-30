import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';

// geminiAPIライブラリとActivityIndicatorをインポート
import { GoogleGenerativeAI } from "@google/generative-ai";
import {ActivityIndicator, Alert} from 'react-native';

// geminiAPIのキー設定 キーはenvファイルに保存
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });// 使用するモデル名（これがいっっちゃん安い）

function AddTaskScreen({ onAdd }) {
    // const [text, setText] = useState('');
    // const [severity, setSeverity] = useState(1);
    // const handlePress = (type) => {
    // if (text.trim() !== '') {
    //     onAdd({ text: text, type: type, severity: severity });
    //     setText('');
    //     setSeverity(1); // 送信後、重要度を初期値の1に戻す
    // }

    const [text, setText] = useState(''); // ユーザーの入力テキスト
    const [isLoadingGemini, setIsLoadingGemini] = useState(false); // gemini呼び出し中のローディング状態


    // 呼び出し、タスクを追加する関数
    const handlePress = async (type) => {
        // 入力が空の場合はアラートを表示
        if (text.trim() === '') {
            Alert.alert('入力エラー', 'タスク名を入力してください。');
            return;
        }
        Keyboard.dismiss();       // 送信と同時にキーボードを閉じる
        setIsLoadingGemini(true); // ローディング開始

        try {
            // Geminiに投げるプロンプト
            const prompt = `
            あなたはタスク管理アシスタントです。ユーザーが入力したタスクの重要度を評価してください。

            # 評価基準
            - 4: 緊急かつ重要。すぐに対応すべきタスク（例：病院の予約、重要な締め切り）
            - 3: 重要だが、少し時間的余裕のあるタスク（例：レポートの作成、会議の準備）
            - 2: 急ぎではないが、忘れてはいけないタスク（例：部屋の掃除、買い物）
            - 1: 個人的な楽しみや、いつかやればいいタスク（例：友達とカラオケ、映画を見る）

            # 出力形式
            {"priority": 数値} というJSON形式で、数値のみを返してください。

            # 評価タスク
            タスク:「${text}」
            `;

            const result = await model.generateContent(prompt);
            const responseText = await result.response.text();

            // Geminiからの応答テキストからJSON部分のみを抽出（gemini作！）
            const match = responseText.match(/```json\n([\s\S]*?)\n```/);
            const jsonString = match ? match[1] : responseText;
            const jsonResponse = JSON.parse(jsonString.trim());
            const priority = jsonResponse.priority;

            // priorityが指定した1-4の範囲内かチェックする
            if (priority >= 1 && priority <= 4) {
                 // onAddを呼び出してタスクを追加
                onAdd({ title: text, type: type, priority: priority });
                setText('');
            } else {
                throw new Error('指定していない、無効な重要度'); // 範囲外ならエラー
            }

        } catch (error) {
            console.error("Gemini APIエラー:", error);
            Alert.alert('エラー', '重要度の取得に失敗しました。');
        } finally {
            setIsLoadingGemini(false); // ローディング終了
        }
    };

  return (
    <View className="flex-1 h-full relative">
      <View className="w-full px-4 ml-5 mr-5">
        <Text className="font-bold text-2xl text-center mb-[40%]">タスク追加</Text>

        {text.trim() !== '' && (
          <View className="mb-4">
            <Text className="text-gray-500 text-sm">追加タスク</Text>
            <Text className="text-gray-800 text-2xl font-bold">{text}</Text>
          </View>
        )}

        {/* 入力フォーム */}
        <View className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 mb-4">
          <TextInput
            placeholder="例）友達とカラオケ"
            value={text}
            onChangeText={setText}
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* 遊び追加ボタン */}
        <TouchableOpacity
          className="w-full bg-orange-400 justify-center items-center py-4 rounded-full mb-3"
          onPress={() => handlePress('遊び')}
        >
          <Text className="text-white font-bold text-lg">遊び追加</Text>
        </TouchableOpacity>

        {/* 仕事追加ボタン */}
        <TouchableOpacity
          className="w-full bg-blue-500 justify-center items-center py-4 rounded-full"
          onPress={() => handlePress('仕事')}
        >
          <Text className="text-white font-bold text-lg">仕事追加</Text>
        </TouchableOpacity>
      </View>

      {/* フルスクリーン・ローディング */}
      {isLoadingGemini && (
        <View
          className="absolute inset-0 items-center justify-center bg-black/30 z-10"
          pointerEvents="auto"
        >
          <ActivityIndicator size="large" />
          <Text className="mt-2.5 text-white text-base">重要度を評価中...</Text>
        </View>
      )}
    </View>
  );
}

export default AddTaskScreen;