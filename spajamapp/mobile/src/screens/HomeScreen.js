// HomeScreen.js
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  LayoutAnimation,
} from 'react-native';
import DraggableFlatList from "react-native-draggable-flatlist";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const BOX_HEIGHT = 40;        // styles.box.height に合わせる
const BOX_MARGIN_V = 0;       // styles.box.marginVertical に合わせる
const ITEM_TOTAL_HEIGHT = BOX_HEIGHT + BOX_MARGIN_V * 2;

export default function HomeScreen() {
  const [workPct] = useState(60);
  const [playPct] = useState(40);
  const total = Math.max(1, workPct + playPct);
  const workRatio = workPct / total;
  const playRatio = playPct / total;

  // 2列分のデータ
  const [leftData, setLeftData] = useState([
    { key: "L1", label: "Left 1" },
    { key: "L2", label: "Left 2" },
    { key: "L3", label: "Left 3" },
  ]);
  const [rightData, setRightData] = useState([
    { key: "R1", label: "Right 1" },
    { key: "R2", label: "Right 2" },
    { key: "R3", label: "Right 3" },
  ]);

  // 各リストの参照 & 現在のスクロールオフセット
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [leftOffset, setLeftOffset] = useState(0);
  const [rightOffset, setRightOffset] = useState(0);

  const animateList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // 削除時の共通処理：データ更新 → 「見え方」を作るために +1行ぶん下へスクロール
  const makeOnDelete = (which /* 'left' | 'right' */) => (itemKey) => {
    animateList();
    if (which === 'left') {
      setLeftData(prev => prev.filter(d => d.key !== itemKey));
      requestAnimationFrame(() => {
        leftRef.current?.scrollToOffset({
          offset: Math.max(0, leftOffset + ITEM_TOTAL_HEIGHT),
          animated: true,
        });
      });
    } else {
      setRightData(prev => prev.filter(d => d.key !== itemKey));
      requestAnimationFrame(() => {
        rightRef.current?.scrollToOffset({
          offset: Math.max(0, rightOffset + ITEM_TOTAL_HEIGHT),
          animated: true,
        });
      });
    }
  };

  // 共通の renderItem（列ごとに onDelete を差し替える）
  const makeRenderItem = (onDelete) =>
    ({ item, drag, isActive }) => (
      <Swipeable
        renderRightActions={() => (
          <View style={styles.deleteBox}>
            <Text style={{ color: "white" }}>ゴミ箱</Text>
          </View>
        )}
        onSwipeableOpen={() => onDelete(item.key)}
      >
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.box,
            isActive && { backgroundColor: "#ffdddd", borderColor: "red", borderWidth: 1 }
          ]}
        >
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      </Swipeable>
    );

  const renderLeftItem = useCallback(makeRenderItem(makeOnDelete('left')), [leftOffset]);
  const renderRightItem = useCallback(makeRenderItem(makeOnDelete('right')), [rightOffset]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />

{/* 2列のbox */}
<View style={styles.columns}>
  {/* Left column */}
  <View style={styles.column}>
    <Text style={styles.columnTitle}>Left</Text>
    <View style={styles.stackArea}>
      {leftData.map((item, idx) => {
        const bottom = idx * ITEM_TOTAL_HEIGHT; // 下から積む
        return (
          <View key={item.key} style={[styles.absItem, { bottom }]}>
            <Swipeable
              renderRightActions={() => (
                <View style={styles.deleteBox}>
                  <Text style={{ color: "white" }}>ゴミ箱</Text>
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

  {/* Right column */}
  <View style={styles.column}>
    <Text style={styles.columnTitle}>Right</Text>
    <View style={styles.stackArea}>
      {rightData.map((item, idx) => {
        const bottom = idx * ITEM_TOTAL_HEIGHT; // 下から積む
        return (
          <View key={item.key} style={[styles.absItem, { bottom }]}>
            <Swipeable
              renderRightActions={() => (
                <View style={styles.deleteBox}>
                  <Text style={{ color: "white" }}>ゴミ箱</Text>
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
            <Text style={styles.barLabelText}>仕事: 30g</Text>
            <Text style={styles.barLabelText}>遊び: 20g</Text>
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
    height: BOX_HEIGHT,          // 40
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: BOX_MARGIN_V, // 0
    backgroundColor: "#eee",
    borderRadius: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  },
  deleteBox: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  stackArea: {
    flex: 1,
    position: 'relative', // 絶対配置の基準
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 0, // 横幅は absItem 側で100%に
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  absItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_TOTAL_HEIGHT, // BOX_HEIGHT + margins（今は40）
    justifyContent: 'center',
  },

});
