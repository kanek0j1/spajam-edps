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
            あなたはユーザーの生活を最適化するタスク管理アシスタントです。
            与えられたタスクの優先度を 1〜10 の整数で評価してください（10 が最優先）。

            【評価で必ず考慮する観点】
            1) 緊急度（直近の締切・開始時刻・遅刻/キャンセルのリスク）
            2) 影響度（遅延の損失：成績/仕事/金銭/信用/健康/法的義務）
            3) 約束・予約の有無（第三者との取り決め、チケット/予約/支払い済み）
            4) 取り返しのつかなさ（機会損失の大きさ・頻度が少ない機会か）
            5) 所要時間と依存関係（前工程/準備が必要か、短時間で終わるか）
            6) 関係資本（人間関係の重要性・希少性・頻度）
              - 「娯楽」タスクもここを重視：
                ・久しぶり/年に一度/遠方から来る 等の再会機会は高評価
                ・家族/親友/重要な同僚との約束は高評価
                ・一人でいつでも代替できる娯楽は低め
            7) 健康・安全（体調・通院・薬・睡眠 等は高評価）

            【スコアの目安】
            - 10: 重大な締切/予約が目前、欠席や遅延で深刻な損失。あるいは極めて希少な重要人との機会（結婚式/葬儀/帰省中の旧友との一回限りの再会など）
            - 8〜9: 48〜72時間以内の重要な締切/会議/提出、または希少で重要な人間関係の約束（年1回レベルの再会、家族イベント、予約済み）
            - 6〜7: 中期的に重要（成績・業務に影響/定期ミーティングの準備/健康面の維持）や、比較的希少な対人予定
            - 4〜5: 先送りしても大損はないが、やっておくと良い用事/普段の娯楽や家事
            - 1〜3: いつでも代替可能な娯楽・思いつき・明確な期限なし

            【ヒント（スコアを押し上げる語彙例）】
            「締切/提出/予約/遅刻/支払い済み/チケット/病院/面接/試験/重要/◯日以内/年に一度/久しぶり/来日中/帰省中/遠方/誕生日/記念日」

            【入力】
            - 種別: 「${type}」  // '仕事' または '遊び'
            - タスク: 「${text}」

            【出力フォーマット（厳守）】
            {"priority": 1〜10の整数}
            ※ 追加説明やコードブロック、Markdownは一切出力しない。
            `.trim();

            const result = await model.generateContent(prompt);
            const responseText = await result.response.text();

            // Geminiからの応答テキストからJSON部分のみを抽出（gemini作！）
            const match = responseText.match(/```json\n([\s\S]*?)\n```/);
            const jsonString = match ? match[1] : responseText;
            const jsonResponse = JSON.parse(jsonString.trim());
            const priority = jsonResponse.priority;

            // priorityが指定した1-10の範囲内かチェックする
            if (priority >= 1 && priority <= 10) {
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