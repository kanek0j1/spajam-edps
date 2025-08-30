// src/screens/HomeScreen.js
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  LayoutAnimation,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
// DraggableFlatList は今回は未使用なので消してOK
// import DraggableFlatList from 'react-native-draggable-flatlist';

import { listTasks, removeTask } from '../lib/tasksRepo';

const BOX_HEIGHT = 40;
const BOX_MARGIN_V = 0;
const ITEM_TOTAL_HEIGHT = BOX_HEIGHT + BOX_MARGIN_V * 2;

export default function HomeScreen() {
  // 左右の表示データ（key/label 形式に整形）
  const [leftData, setLeftData] = useState([]);   // 仕事
  const [rightData, setRightData] = useState([]); // 遊び

  // バーの値（severity 合計）
  const [workSum, setWorkSum] = useState(0);
  const [playSum, setPlaySum] = useState(0);

  // （スクロール参照。今は絶対配置なので無くてもOK）
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [leftOffset, setLeftOffset] = useState(0);
  const [rightOffset, setRightOffset] = useState(0);

  const total = Math.max(1, workSum + playSum);
  const workRatio = workSum / total;
  const playRatio = playSum / total;

  const animateList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // JSON（AsyncStorage）から読み込んで左右に振り分け
  const load = useCallback(async () => {
    const tasks = await listTasks();
    const left = tasks
      .filter(t => t.type === '仕事')
      .map(t => ({ key: t.id, label: t.text, severity: t.severity }));
    const right = tasks
      .filter(t => t.type !== '仕事') // '遊び' を想定。他のカテゴリも右に
      .map(t => ({ key: t.id, label: t.text, severity: t.severity }));
    setLeftData(left);
    setRightData(right);

    const w = left.reduce((s, x) => s + (x.severity ?? 1), 0);
    const p = right.reduce((s, x) => s + (x.severity ?? 1), 0);
    setWorkSum(w);
    setPlaySum(p);
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // 削除（見た目更新＋ストレージからも削除）
  const makeOnDelete = (which /* 'left' | 'right' */) => async (itemKey) => {
    try {
      await removeTask(itemKey);      // 先に保存側を削除
    } finally {
      animateList();
      if (which === 'left') {
        setLeftData(prev => prev.filter(d => d.key !== itemKey));
        setWorkSum(prev => Math.max(0, prev - 1)); // 大まかな即時反映（後でloadが正に直す）
        requestAnimationFrame(() => {
          leftRef.current?.scrollToOffset?.({
            offset: Math.max(0, leftOffset + ITEM_TOTAL_HEIGHT),
            animated: true,
          });
        });
      } else {
        setRightData(prev => prev.filter(d => d.key !== itemKey));
        setPlaySum(prev => Math.max(0, prev - 1));
        requestAnimationFrame(() => {
          rightRef.current?.scrollToOffset?.({
            offset: Math.max(0, rightOffset + ITEM_TOTAL_HEIGHT),
            animated: true,
          });
        });
      }
      // もう一度正確に再集計
      load();
    }
  };

  // 共通の item renderer（長押しでドラッグは未使用）
  const makeRenderItem = (onDelete) =>
    ({ item, isActive }) => (
      <Swipeable
        renderRightActions={() => (
          <View style={styles.deleteBox}>
            <Text style={{ color: 'white' }}>ゴミ箱</Text>
          </View>
        )}
        onSwipeableOpen={() => onDelete(item.key)}
      >
        <Pressable
          style={[
            styles.box,
            isActive && { backgroundColor: '#ffdddd', borderColor: 'red', borderWidth: 1 },
          ]}
        >
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      </Swipeable>
    );

  const renderLeftItem = useCallback(makeRenderItem(makeOnDelete('left')), [leftOffset, load]);
  const renderRightItem = useCallback(makeRenderItem(makeOnDelete('right')), [rightOffset, load]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />

        {/* 2列のbox（下から積むレイアウト） */}
        <View style={styles.columns}>
          {/* Left = 仕事 */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Left（仕事）</Text>
            <View style={styles.stackArea}>
              {leftData.map((item, idx) => {
                const bottom = idx * ITEM_TOTAL_HEIGHT;
                return (
                  <View key={item.key} style={[styles.absItem, { bottom }]}>
                    <Swipeable
                      renderRightActions={() => (
                        <View style={styles.deleteBox}>
                          <Text style={{ color: 'white' }}>ゴミ箱</Text>
                        </View>
                      )}
                      onSwipeableOpen={() => makeOnDelete('left')(item.key)}
                    >
                      <Pressable style={styles.box}>
                        <Text style={styles.label}>{item.label}</Text>
                      </Pressable>
                    </Swipeable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Right = 遊び */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Right（遊び）</Text>
            <View style={styles.stackArea}>
              {rightData.map((item, idx) => {
                const bottom = idx * ITEM_TOTAL_HEIGHT;
                return (
                  <View key={item.key} style={[styles.absItem, { bottom }]}>
                    <Swipeable
                      renderRightActions={() => (
                        <View style={styles.deleteBox}>
                          <Text style={{ color: 'white' }}>ゴミ箱</Text>
                        </View>
                      )}
                      onSwipeableOpen={() => makeOnDelete('right')(item.key)}
                    >
                      <Pressable style={styles.box}>
                        <Text style={styles.label}>{item.label}</Text>
                      </Pressable>
                    </Swipeable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ヘッダーUI（下） */}
        <View style={styles.header}>
          <Image
            style={{ width: 120, height: 120 }}
            source={require('../images/base.jpg')}
          />
          <View style={[styles.barContainer, { marginTop: 12 }]}>
            <View style={[styles.barFillBlue, { flex: workRatio }]} />
            <View style={[styles.barFillOrange, { flex: playRatio }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabelText}>仕事: {workSum}g</Text>
            <Text style={styles.barLabelText}>遊び: {playSum}g</Text>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // --- ヘッダーUI ---
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

  // --- 2列レイアウト ---
  columns: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  column: { flex: 1, paddingHorizontal: 6 },
  columnTitle: { fontWeight: 'bold', marginBottom: 8 },

  // --- アイテム ---
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
  stackArea: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 0,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  absItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_TOTAL_HEIGHT,
    justifyContent: 'center',
  },
});