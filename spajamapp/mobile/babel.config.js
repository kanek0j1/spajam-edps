module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],                // ← これ必須
    // reanimated を使っているなら最後に追加:
    // plugins: ['nativewind/babel', 'react-native-reanimated/plugin'],
  };
};
