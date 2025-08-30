// src/screens/HomeScreen.js — 天秤：梁は回転、base/armは“不動の絶対座標”（内容に依存しない）
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

// ===== 天秤チューニング =====
const MAX_SHIFT = 60;                 // 片側の最大上下移動(px)
const STEP_PER_DIFF = 12;             // 個数差1あたりの移動量(px)
const MIN_COL_HEIGHT = SCREEN_H * 0.4;
const MAX_DEG = 30;                   // 梁の最大回転角（度）

// ===== “不動の”配置用ステージ定数（px固定） =====
// scaleArea 内での固定Y座標。%指定をやめ、pxで固定する。
const STAGE_HEIGHT = 360;             // 天秤一式の表示ステージの高さ（必要に応じて調整）
const ARM_Y = 236;                     // 梁(arm.png) の上端Y（scaleArea基準、px）
const BASE_Y = 278;                   // base.png の上端Y（scaleArea基準、px）

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

    // 差分→目標シフト
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

  // 梁の回転（方向は“逆”指定）：-MAX_SHIFT～+MAX_SHIFT → +MAX_DEG～-MAX_DEG
  const armRotate = tilt.interpolate({
    inputRange: [-MAX_SHIFT, MAX_SHIFT],
    outputRange: [`${MAX_DEG}deg`, `-${MAX_DEG}deg`],
    extrapolate: 'clamp',
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />

        {/* 画面全体スクロール */}
        <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator>
          {/* ===== 天秤エリア（不動のステージ内に arm/base を“px固定”で絶対配置） ===== */}
          <View style={[styles.scaleArea, { height: STAGE_HEIGHT }]}>
            {/* 梁（arm.png）：px固定の絶対座標＋回転 */}
            <Animated.Image
              source={require('../images/arm.png')}
              style={[
                styles.arm,
                { top: ARM_Y, transform: [{ rotateZ: armRotate }] },
              ]}
            />

            {/* base.png：px固定の絶対座標 */}
            <Image
              source={require('../images/base.png')}
              style={[styles.base, { top: BASE_Y }]}
            />

            {/* 下端基準の2列（列自体が上下にスライド） */}
            <View style={styles.columnsRow}>
              {/* Left column */}
              <Animated.View style={[styles.column, { transform: [{ translateY: leftTranslateY }] }]}>
                <Text style={styles.columnTitle}>Left（仕事）</Text>
                <Image source={require('../images/dish.png')} style={styles.dish} />
                <View style={styles.columnBox}>
                  <View style={[styles.columnInner, { minHeight: MIN_COL_HEIGHT }]}>
                    {leftData.map(renderLeft)}
                  </View>
                </View>
              </Animated.View>

              {/* Right column */}
              <Animated.View style={[styles.column, { transform: [{ translateY: rightTranslateY }] }]}>
                <Text style={styles.columnTitle}>Right（遊び）</Text>
                <Image source={require('../images/dish.png')} style={styles.dish} />
                <View style={styles.columnBox}>
                  <View style={[styles.columnInner, { minHeight: MIN_COL_HEIGHT }]}>
                    {rightData.map(renderRight)}
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>

          {/* バー（天秤の下側。通常レイアウトで固定） */}
          <View style={styles.header}>
            <View style={[styles.barContainer, { marginTop: 0 }]}>
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

  // 天秤エリア（arm/base を絶対配置するため relative。高さは STAGE_HEIGHT で固定）
  scaleArea: {
    position: 'relative',
    paddingTop: 0,
    paddingBottom: 0,
  },

  // 梁（arm.png）
  arm: {
    position: 'absolute',
    left: '20%',
    width: 210,
    height: 160,
    resizeMode: 'contain',
    zIndex: 0,           // 皿や base より背面
    pointerEvents: 'none',
  },

  // 下端基準の 2 列行
  columnsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,                 // ステージ下端を基準
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',    // 列の下端を揃える
    paddingTop: MAX_SHIFT,     // 上に振れる余白（列内で完結）
    paddingBottom: MAX_SHIFT,  // 下に沈む余白（列内で完結）
  },

  column: { flex: 1 },
  columnTitle: { fontWeight: 'bold', marginBottom: 8 },

  // 枠
  columnBox: {
    borderWidth: 1,
    borderColor: '#f4f4f4',
    color:'#333',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
  },

  // 列の中身（常に下寄せ）
  columnInner: {
    flexGrow: 1,

    justifyContent: 'flex-end',
  },

  // --- ボックス ---
  box: {
    height: BOX_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: BOX_MARGIN_V,
    backgroundColor:'#dddddd',
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

  // 皿
  dish: {
    position: 'absolute',
    bottom: -90,
    left: '8%',
    transform: [{ translateX: -50 }],
    width: 240,
    height: 140,
    resizeMode: 'contain',
    zIndex: 1,
    pointerEvents: 'none', 
  },

  // base.png（“不動”：px固定の絶対座標）
  base: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -60 }],
    width: 120,
    height: 120,
    resizeMode: 'contain',
    zIndex: 2,
    pointerEvents: 'none',
  },

  // バー（通常レイアウト）
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
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
