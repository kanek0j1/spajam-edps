// src/screens/HomeScreen.js — 天秤：priorityを重さに、タップでモーダル。スワイプ時はモーダル抑制、ラベルは上固定で拡大
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
  Modal,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const BOX_HEIGHT = 40;
const BOX_MARGIN_V = 0;

const { height: SCREEN_H } = Dimensions.get('window');

// ===== 天秤チューニング =====
const MAX_SHIFT = 60; // 片側の最大上下移動(px)
const STEP_PER_DIFF = 12; // 「重さ差 1」あたりの移動量(px)
const MIN_COL_HEIGHT = SCREEN_H * 0.4;
const MAX_DEG = 30; // 梁の最大回転角（度）

// ===== “不動の”配置用ステージ定数（px固定） =====
const STAGE_HEIGHT = 360;
const ARM_Y = 236;
const BASE_Y = 278;

// スワイプ→削除の直後は何msタップを無効化するか
const SUPPRESS_TAP_MS = 400;

// ラベルのフォントサイズ範囲
const LABEL_MIN_SIZE = 14;
const LABEL_MAX_SIZE = 64;
const LABEL_SLOT_HEIGHT = LABEL_MAX_SIZE;

export default function HomeScreen({ tasks: list, setTasks: setList }) {
  const [leftData, setLeftData] = useState([]); // 左(仕事)
  const [rightData, setRightData] = useState([]); // 右(休息)
  const [workSum, setWorkSum] = useState(0);
  const [playSum, setPlaySum] = useState(0);
  const [preview, setPreview] = useState(null);

  const tilt = useRef(new Animated.Value(0)).current;
  const suppressTapUntilRef = useRef(0);

  const total = Math.max(1, workSum + playSum);
  const workRatio = workSum / total;
  const playRatio = playSum / total;

  const workFontSize = LABEL_MIN_SIZE + (LABEL_MAX_SIZE - LABEL_MIN_SIZE) * workRatio;
  const playFontSize = LABEL_MIN_SIZE + (LABEL_MAX_SIZE - LABEL_MIN_SIZE) * playRatio;

  const animateList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  useEffect(() => {
    const norm = (v) => {
      const n = Math.round(Number(v));
      if (!isFinite(n) || n <= 0) return 1;
      return n;
    };

    const left = list
      .filter((t) => t.type === '仕事')
      .map((t, idx) => ({
        key: t.id ?? String(idx),
        label: t.title ?? t.text ?? '',
        weight: norm(t.priority),
      }));

    const right = list
      .filter((t) => t.type !== '仕事')
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

    const diff = wSum - pSum;
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
    suppressTapUntilRef.current = Date.now() + SUPPRESS_TAP_MS;
    setList((prev) => prev.filter((d) => d.id !== itemKey && d.key !== itemKey));
    setPreview((prev) => (prev?.key === itemKey ? null : prev));
  };

  const openPreview = (item) => {
    if (Date.now() < suppressTapUntilRef.current) return;
    setPreview(item);
  };
  const closePreview = () => setPreview(null);

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
      <Pressable style={styles.box} onPress={() => openPreview(item)}>
        <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
          {item.label}
        </Text>
      </Pressable>
    </Swipeable>
  );

  const renderLeft = renderItem(makeOnDelete());
  const renderRight = renderItem(makeOnDelete());

  const leftTranslateY = tilt;
  const rightTranslateY = Animated.multiply(tilt, -1);

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
              <Animated.View style={[styles.column, { transform: [{ translateY: leftTranslateY }] }]}>
                <Image source={require('../images/dish.png')} style={styles.dish} />
                <View style={styles.columnBox}>
                  <View style={[styles.columnInner, { minHeight: MIN_COL_HEIGHT }]}>
                    {leftData.map(renderLeft)}
                  </View>
                </View>
              </Animated.View>

              <Animated.View
                style={[styles.column, { transform: [{ translateY: rightTranslateY }] }]}
              >
                <Image source={require('../images/dish.png')} style={styles.dish} />
                <View style={styles.columnBox}>
                  <View style={[styles.columnInner, { minHeight: MIN_COL_HEIGHT }]}>
                    {rightData.map(renderRight)}
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>

          {/* バー＋ラベル */}
          <View style={styles.header}>
            <View style={styles.barContainer}>
              <View style={[styles.barFillBlue, { flex: workRatio }]} />
              <View style={[styles.barFillOrange, { flex: playRatio }]} />
            </View>

            <View style={styles.roleLabels}>
              {/* 左側（仕事） */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <View style={styles.roleSlot}>
                  <Text
                    style={[
                      styles.roleText,
                      { color: '#3b82f6', fontSize: workFontSize, lineHeight: workFontSize },
                    ]}
                  >
                    仕事
                  </Text>
                </View>
                <Text style={[styles.rolePercent, { color: '#3b82f6', marginLeft: 6 }]}>
                  {Math.round(workRatio * 100)}%
                </Text>
              </View>

              {/* 右側（休息） */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={[styles.rolePercent, { color: '#fb923c', marginRight: 6 }]}>
                  {Math.round(playRatio * 100)}%
                </Text>
                <View style={styles.roleSlot}>
                  <Text
                    style={[
                      styles.roleText,
                      { color: '#fb923c', fontSize: playFontSize, lineHeight: playFontSize },
                    ]}
                  >
                    休息
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* プレビュー用モーダル */}
        <Modal visible={!!preview} transparent animationType="fade" onRequestClose={closePreview}>
          <View style={styles.overlayRoot}>
            <Pressable style={styles.overlayBackdrop} onPress={closePreview} />
            <View style={styles.overlayCard}>
              <ScrollView bounces={false}>
                <Text style={styles.overlayLabel}>{preview?.label}</Text>
              </ScrollView>
              <Pressable style={styles.overlayClose} onPress={closePreview}>
                <Text style={styles.overlayCloseText}>閉じる</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  scaleArea: { position: 'relative' },
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
  columnBox: {
    borderWidth: 1,
    borderColor: '#f4f4f4',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
  },
  columnInner: { flexGrow: 1, justifyContent: 'flex-end' },
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
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 12 },
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

  // ラベル部分
  roleLabels: {
    width: 256,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  roleSlot: {
    height: LABEL_SLOT_HEIGHT,
    justifyContent: 'flex-start', // 上基準
  },
  roleText: {
    fontWeight: '800',
  },
  rolePercent: {
    fontSize: 14,
  },

  // ==== Overlay ====
  overlayRoot: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlayBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  overlayCard: {
    maxHeight: '70%',
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  overlayLabel: { fontSize: 18, lineHeight: 26 },
  overlayClose: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  overlayCloseText: { color: 'white', fontWeight: '600' },
});
