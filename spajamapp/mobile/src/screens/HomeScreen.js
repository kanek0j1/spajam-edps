// src/screens/HomeScreen.js — 天秤：梁は回転、base/armは“不動の絶対座標”
// props の list/setList を利用し、priority を「重さ」として使用
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
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
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const BOX_HEIGHT = 40;
const BOX_MARGIN_V = 0;

const { height: SCREEN_H } = Dimensions.get('window');

// ===== 天秤チューニング =====
const MAX_SHIFT = 60;                 // 片側の最大上下移動(px)
const STEP_PER_DIFF = 12;             // 「重さ差 1」あたりの移動量(px)
const MIN_COL_HEIGHT = SCREEN_H * 0.4;
const MAX_DEG = 30;                   // 梁の最大回転角（度）

// ===== “不動の”配置用ステージ定数（px固定） =====
const STAGE_HEIGHT = 360;
const ARM_Y = 236;
const BASE_Y = 278;

export default function HomeScreen({ tasks: list, setTasks: setList }) {
  const [leftData, setLeftData] = useState([]);   // 左(仕事)
  const [rightData, setRightData] = useState([]); // 右(遊び)
  const [workSum, setWorkSum] = useState(0);      // 左の総「重さ」= priority 合計
  const [playSum, setPlaySum] = useState(0);      // 右の総「重さ」

  // アニメ値（-MAX_SHIFT ～ +MAX_SHIFT、正=左が重い）
  const tilt = useRef(new Animated.Value(0)).current;

  const total = Math.max(1, workSum + playSum);
  const workRatio = workSum / total;
  const playRatio = playSum / total;

  const animateList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // props の list が変化したら再集計（priority を重さとして使用）
  useEffect(() => {
    // priority の正規化：未定義や異常値は 1 に丸める
    const norm = (v) => {
      const n = Math.round(Number(v));
      if (!isFinite(n) || n <= 0) return 1;
      return n;
    };

    const left = list
      .filter(t => t.type === '仕事')
      .map((t, idx) => ({
        key: t.id ?? String(idx),
        label: t.title ?? t.text ?? '',
        weight: norm(t.priority),
      }));

    const right = list
      .filter(t => t.type !== '仕事')
      .map((t, idx) => ({
        key: t.id ?? String(idx),
        label: t.title ?? t.text ?? '',
        weight: norm(t.priority),
      }));

    setLeftData(left);
    setRightData(right);

    const wSum = left.reduce((s, x) => s + x.weight, 0);
    const pSum = right.reduce((s, x) => s + x.weight, 0);
    setWorkSum(wSum);
    setPlaySum(pSum);

    // 「重さの差」に応じてシフト
    const diff = wSum - pSum; // 正: 左が重い
    const targetShift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, diff * STEP_PER_DIFF));

    Animated.timing(tilt, {
      toValue: targetShift,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [list, tilt]);

  const makeOnDelete = () => (itemKey) => {
    animateList();
    setList(prev => prev.filter(d => d.id !== itemKey && d.key !== itemKey));
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

  const renderLeft = renderItem(makeOnDelete());
  const renderRight = renderItem(makeOnDelete());

  // 左右列の縦移動：下端基準
  const leftTranslateY = tilt;
  const rightTranslateY = Animated.multiply(tilt, -1);

  // 梁の回転：逆方向（左が重いと時計回り）
  const armRotate = tilt.interpolate({
    inputRange: [-MAX_SHIFT, MAX_SHIFT],
    outputRange: [`${MAX_DEG}deg`, `-${MAX_DEG}deg`],
    extrapolate: 'clamp',
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator>
          {/* 天秤エリア */}
          <View style={[styles.scaleArea, { height: STAGE_HEIGHT }]}>
            <Animated.Image
              source={require('../images/arm.png')}
              style={[styles.arm, { top: ARM_Y, transform: [{ rotateZ: armRotate }] }]}
            />
            <Image source={require('../images/base.png')} style={[styles.base, { top: BASE_Y }]} />

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

          {/* バー */}
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
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  scaleArea: {
    position: 'relative',
    paddingTop: 0,
    paddingBottom: 0,
  },
  arm: {
    position: 'absolute',
    left: '20%',
    width: 210,
    height: 160,
    resizeMode: 'contain',
    zIndex: 0,
    pointerEvents: 'none',
  },
  columnsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    paddingTop: MAX_SHIFT,
    paddingBottom: MAX_SHIFT,
  },
  column: { flex: 1 },
  columnTitle: { fontWeight: 'bold', marginBottom: 8 },
  columnBox: {
    borderWidth: 1,
    borderColor: '#f4f4f4',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
  },
  columnInner: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  box: {
    height: BOX_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: BOX_MARGIN_V,
    backgroundColor: '#dddddd',
    borderRadius: 12,
  },
  label: { fontSize: 18, fontWeight: '500' },
  deleteBox: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
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
