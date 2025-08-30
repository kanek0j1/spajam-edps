import { registerRootComponent } from 'expo';

const SAMPLE = [
  { id: '1', title: '友達と映画',   priority: 2, category: '遊び' },
  { id: '2', title: 'ミーティング準備', priority: 4, category: '仕事' },
  { id: '3', title: 'ランニング',   priority: 1, category: '遊び' },
  { id: '4', title: 'レポート提出', priority: 5, category: '仕事' },
  { id: '5', title: 'カフェで読書', priority: 3, category: '遊び' },
];

function App() {
return <TaskListScreen tasks={SAMPLE} />;
}å
registerRootComponent(App);