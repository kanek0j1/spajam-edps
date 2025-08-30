// src/screens/HomeScreen.js — 天秤：梁ナシ、下端基準で左右が傾く
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  LayoutAnimation,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

import { listTasks, removeTask } from '../lib/tasksRepo';

const BOX_HEIGHT = 40;
const BOX_MARGIN_V = 0;
const ITEM_TOTAL_HEIGHT = BOX_HEIGHT + BOX_MARGIN_V * 2;

const { height: SCREEN_H } = Dimensions.get('window');

// 天秤チューニング
const MAX_SHIFT = 60;          // 片側の最大上下移動(px) — 行に余白も確保
const STEP_PER_DIFF = 12;      // “個数差1” あたりの移動量(px)
const MIN_COL_HEIGHT = SCREEN_H * 0.4; // 少数件でも下に貼り付く最低高さ

export default function HomeScreen() {
  const [leftData, setLeftData] = useState([]);   // 左(仕事)
  const [rightData, setRightData] = useState([]); // 右(遊び)

  // 表示用（1個=重さ1）
  const [workSum, setWorkSum] = useState(0);
  const [playSum, setPlaySum] = useState(0);

  // アニメ値（-MAX_SHIFT ～ +MAX_SHIFT、正=左が重い）
  const tilt = useRef(new Animated.Value(0)).current;

  const total = Math.max(1, workSum + playSum);
  const workRatio = workSum / total;
  const playRatio = playSum / total;

  const animateList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const load = useCallback(async () => {
    const tasks = await listTasks();

    const left = tasks
      .filter(t => t.type === '仕事')
      .map(t => ({ key: t.id, label: t.text }));

    const right = tasks
      .filter(t => t.type !== '仕事')
      .map(t => ({ key: t.id, label: t.text }));

    setLeftData(left);
    setRightData(right);

    setWorkSum(left.length);
    setPlaySum(right.length);

    // 差分→目標シフト（下端基準で上下にスライド）
    const diff = left.length - right.length; // 正: 左が重い
    const targetShift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, diff * STEP_PER_DIFF));
    Animated.timing(tilt, {
      toValue: targetShift,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [tilt]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const makeOnDelete = (which /* 'left' | 'right' */) => async (itemKey) => {
    try {
      await removeTask(itemKey);
    } finally {
      animateList();
      if (which === 'left') {
        setLeftData(prev => prev.filter(d => d.key !== itemKey));
        setWorkSum(prev => Math.max(0, prev - 1));
      } else {
        setRightData(prev => prev.filter(d => d.key !== itemKey));
        setPlaySum(prev => Math.max(0, prev - 1));
      }
      load(); // 正確に再集計＆再アニメ
    }
  };

  const renderItem = (onDelete) => (item) => (
    <Swipeable
      key={item.key}
      renderRightActions={() => (
        <View style={styles.deleteBox}>
          <Text style={{ color: 'white' }}>ゴミ箱</Text>
        </View>
      )}
      onSwipeableOpen={() => onDelete(item.key)}
    >
      <Pressable style={styles.box}>
        <Text style={styles.label}>{item.label}</Text>
      </Pressable>
    </Swipeable>
  );

  const renderLeft = renderItem(makeOnDelete('left'));
  const renderRight = renderItem(makeOnDelete('right'));

  // 左右列の縦移動：下端基準
  const leftTranslateY = tilt;                          // + で下に沈む
  const rightTranslateY = Animated.multiply(tilt, -1);  // 逆相で上がる

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />

        {/* 画面全体スクロール */}
        <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator>
          {/* 天秤エリア：下端基準にそろえ、上下に揺れる余白を用意 */}
          <View style={styles.scaleArea}>
            <View style={styles.columnsRow}>
              {/* Left */}
              <Animated.View style={[styles.column, { transform: [{ translateY: leftTranslateY }] }]}>
                <Text style={styles.columnTitle}>Left（仕事）</Text>
                <View style={styles.columnBox}>
                  <View style={[styles.columnInner, { minHeight: MIN_COL_HEIGHT }]}>
                    {leftData.map(renderLeft)}
                  </View>
                </View>
              </Animated.View>

              {/* Right */}
              <Animated.View style={[styles.column, { transform: [{ translateY: rightTranslateY }] }]}>
                <Text style={styles.columnTitle}>Right（遊び）</Text>
                <View style={styles.columnBox}>
                  <View style={[styles.columnInner, { minHeight: MIN_COL_HEIGHT }]}>
                    {rightData.map(renderRight)}
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>

          {/* 下のヘッダーUI（バーや画像） */}
          <View style={styles.header}>
            <Image
              style={{ width: 120, height: 120 }}
              source={require('../images/base.png')}
            />
            <View style={[styles.barContainer, { marginTop: 12 }]}>
              <View style={[styles.barFillBlue, { flex: workRatio }]} />
              <View style={[styles.barFillOrange, { flex: playRatio }]} />
            </View>
            <View style={styles.barLabels}>
              <Text style={styles.barLabelText}>左の重さ: {workSum}</Text>
              <Text style={styles.barLabelText}>右の重さ: {playSum}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // ScrollView 全体
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // 天秤エリア
  scaleArea: {
    // ここはコンテナ。中の row で下端基準を作る
  },

  // 下端基準の 2 列行
  columnsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',    // ← 列の下端を揃える“基準”
    paddingTop: MAX_SHIFT,     // 上に振れる余白
    paddingBottom: MAX_SHIFT,  // 下に沈む余白
  },

  column: { flex: 1 },
  columnTitle: { fontWeight: 'bold', marginBottom: 8 },

  // 枠
  columnBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  // 列の中身（ここで“下寄せ”）
  columnInner: {
    flexGrow: 1,
    justifyContent: 'flex-end', // 常に下から積む
  },

  // --- ボックス ---
  box: {
    height: BOX_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: BOX_MARGIN_V,
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
  },
  deleteBox: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },

  // 下のヘッダー（バーなど）
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  barContainer: {
    width: 256,
    height: 32,
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a3a3a3',
    overflow: 'hidden',
    backgroundColor: '#e5e5e5',
  },
  barFillBlue: { height: '100%', backgroundColor: '#3b82f6' },
  barFillOrange: { height: '100%', backgroundColor: '#fb923c' },
  barLabels: {
    width: 256,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabelText: { fontSize: 14 },
});
