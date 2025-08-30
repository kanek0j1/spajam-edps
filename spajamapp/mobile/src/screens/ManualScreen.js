import { StatusBar } from 'expo-status-bar';
import React, { useState,  useRef, useLayoutEffect  } from "react";
import { StyleSheet, Text, View, ScrollView, Dimensions, Image, Button, SafeAreaView, TouchableOpacity} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_LAUNCHED_KEY = '@hasLaunched';

const manualData = [
  {
    id: 1,
    title: 'トップ画面操作',
    // 画像はプロジェクト内の適切なパスを指定してください
    // image: require('../assets/manual-image-1.png'),
    description: 'なんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃら。',
  },
  {
    id: 2,
    title: '次のページの操作',
    // image: require('../assets/manual-image-2.png'),
    description: 'これは2ページ目の説明です。なんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃら。',
  },
  {
    id: 3,
    title: 'さらに次のページの操作',
    // image: require('../assets/manual-image-3.png'),
    description: 'これは3ページ目の説明です。なんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃらなんちゃら。',
  },
];

const { width } = Dimensions.get('window');

export default function ManualScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
    });
  }, [navigation]);

  const handlePressOk = async () => {
    try {
      // 「アプリは起動済み」というフラグを保存
      await AsyncStorage.setItem(HAS_LAUNCHED_KEY, 'true');
      
      // 'Main'スクリーンに遷移する。'replace'を使うことで、この画面に戻れなくする
      navigation.replace('Main');
    } catch (error) {
      console.error("Failed to save launch status.", error);
    }
  };

  // スクロール位置から現在表示されているページのインデックスを計算
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const isLastPage = activeIndex === manualData.length - 1;

  return (
    <View className="flex-1 bg-white pt-16">
      <StatusBar style="auto" />
      
      {/* --- メインタイトル --- */}
      <View className="px-5 pb-4">
        <Text className="text-2xl font-bold text-center">マニュアル</Text>
      </View>

      {/* --- スライド部分 --- */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // onScrollイベントの発生頻度を調整
        className="flex-1"
      >
        {manualData.map((item) => (
          <View style={{ width }} key={item.id} className="items-center px-6 py-4">
            {/* ページタイトル */}
            <Text className="text-xl font-semibold mb-6">{item.title}</Text>
            
            {/* 画像プレースホルダー */}
            {/* 画像ファイルがある場合は <Image> タグを使用してください */}
            {/* <Image source={item.image} className="w-full h-64 rounded-lg bg-gray-200 mb-6" resizeMode="contain" /> */}
            <View className="w-full h-64 rounded-lg bg-gray-300 mb-6" />
            
            {/* 説明文 */}
            <Text className="text-base text-gray-700 leading-6">
              {item.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* --- ページネーション（現在位置を示すドット） --- */}
      <View className="flex-row justify-center items-center py-6">
        {manualData.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full mx-1.5 ${
              activeIndex === index ? 'bg-black' : 'bg-gray-300'
            }`}
          />
        ))}
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handlePressOk}
          // 最後のページでのみボタンを有効にする
          disabled={!isLastPage}
          // 最後のページかどうかで背景色を切り替える
          className={`py-4 rounded-xl ${
            isLastPage ? 'bg-blue-500' : 'bg-transparent'
          }`}
        >
          {/* 最後のページかどうかで文字色を切り替える */}
          <Text className={`text-center text-lg font-bold ${
            isLastPage ? 'text-white' : 'text-transparent'
          }`}>
            始める
          </Text>
        </TouchableOpacity>
      </View>


    </View>
  );
}
