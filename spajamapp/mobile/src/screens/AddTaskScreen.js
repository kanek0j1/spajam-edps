import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Keyboard} from 'react-native';

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
            与えられたタスクを 1〜10 の整数で厳密に評価してください（10 が最優先）。

            【必ず踏む手順】
            STEP1. 各観点を0〜100で内部評価（出力しない）
              U 緊急度：締切/開始が近い、遅刻・キャンセルのリスク
              I 影響度：成績/仕事/金銭/信用/健康/法的義務への影響
              C 拘束力：第三者との約束/予約/チケット/支払い済み
              R 関係資本：人間関係の重要性・希少性（※「遊び」でも重視）
                  例: 「年に一度」「久しぶり」「遠方から来る」「家族/親友」「来日中/帰省中」→高評価
                  逆に、いつでも代替可能な一人娯楽は低評価
              H 健康・安全：通院・薬・睡眠・メンタル等
              D 代替困難度：リスケしづらさ・前工程の依存
              ※ヒント語彙（高評価に寄与）：「締切/提出/予約/遅刻/面接/試験/病院/支払い済み/◯日以内/年に一度/久しぶり/来日中/遠方/誕生日/記念日」

            STEP2. 重み付き合成（内部で計算、出力しない）
              raw = 0.24*U + 0.24*I + 0.18*C + 0.16*R + 0.14*H + 0.04*D
              追加ルール（シャープ化：中庸回避）
              - U>=85 または H>=85 または (R>=85 かつ 種別が「遊び」) のとき raw を少なくとも 80 に引き上げる
              - U,I,C,H のいずれも <=30 かつ 予約/第三者が無い場合は raw を最大でも 30 に抑える
              - 「今日/明日/今週末/◯日以内」等の明示があれば U を底上げ（+10〜20、上限100）

            STEP3. 1〜10へマッピング（四捨五入ではなく**等幅ビン**）
              1: 0-9, 2:10-19, 3:20-29, 4:30-39, 5:40-49,
              6:50-59, 7:60-69, 8:70-79, 9:80-89, 10:90-100
              ※「とりあえず真ん中」は禁止。7や4にしがみつかないこと。
              ※7または4を返すのは、そのビンの根拠が明確な場合のみ（基準に該当する証拠が複数あるとき）。

            【スコアの意味（目安）】
              10: 重大締切/予約が目前、欠席で深刻損失／極めて希少な重要人との機会（例：面接、試験日、病院の予約、葬儀、年1回の再会 等）
              8-9: 72時間以内の重要提出・会議、予約あり、または希少で重要な対人イベント
              6-7: 中期的に重要（準備が必要/依存あり）や比較的希少な対人予定
              4-5: 先送り可能だが実施価値ありの用事（通常の家事・学習・普段の娯楽）
              1-3: いつでも代替可能な娯楽・思いつき・明確な期限なし

            【種別とタスク】
            - 種別: 「${type}」  // '仕事' もしくは '遊び'
            - タスク: 「${text}」

            【出力（厳守）】
            {"priority": 1〜10の整数}
            ※JSONのみ。説明やコードブロック、Markdownを出力しない。
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
    <View className="flex-1 h-full relative bg-white">
      <View className="px-4 mx-5 ">
        <Text className="font-bold text-2xl text-center mb-[25%] pt-16">タスク追加</Text>

        {/* {text.trim() !== '' && (
          <View className="mb-4">
            <Text className="text-gray-500 text-sm">追加タスク</Text>
            <Text className="text-gray-800 text-2xl font-bold">{text}</Text>
          </View>
        )} */}

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
          className="absolute left-0 right-0 top-0 bottom-0 items-center justify-center bg-black/40 z-10"
          pointerEvents="auto"
        >
          <ActivityIndicator size="large" color="#3d85c6" />
          <Text className="mt-2.5 text-white text-base">重要度を評価中...</Text>
        </View>
      )}
    </View>
  );
}

export default AddTaskScreen;