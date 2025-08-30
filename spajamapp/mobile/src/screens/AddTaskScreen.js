import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

function AddTaskScreen() {
    const [text, setText] = useState('');
    const [severity, setSeverity] = useState(1);
    const handlePress = (type) => {
    if (text.trim() !== '') {
        onAdd({ text: text, type: type, severity: severity });
        setText('');
        setSeverity(1); // 送信後、重要度を初期値の1に戻す
    }
    };

    return (
        <View className="w-full px-4 ml-5 mr-5">

            <Text className="font-bold text-2xl text-center mb-[40%]">タスク追加</Text>

            {text.trim() !== '' && (
                <View className="mb-4">
                <Text className="text-gray-500 text-sm">追加タスク</Text>
                <Text className="text-gray-800 text-2xl font-bold">{text}</Text>
                </View>
            )}

            {/* 入力フォーム */}
            <View className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 mb-4">
                <Text className="text-gray-800 text-base">追加タスク名を入れる</Text>
                <View className="w-full h-px bg-gray-300 my-2" />
                <TextInput
                    placeholder="例）友達とカラオケ"
                    value={text}
                    onChangeText={setText}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View className="w-full mb-6">
                <Text className="text-gray-500 text-base mb-3">重要度</Text>
                <View className="flex-row justify-around">
                    {[1, 2, 3, 4].map((level) => (
                        <TouchableOpacity
                            key={level}
                            onPress={() => setSeverity(level)}
                            // 選択されているレベルに応じて背景色を変更
                            className={`w-12 h-12 rounded-full items-center justify-center ${
                                severity === level ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                        >
                            {/* 選択されているレベルに応じて文字色を変更 */}
                            <Text className={`font-bold text-lg ${
                                severity === level ? 'text-white' : 'text-gray-800'
                            }`}>
                            {level}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 遊び追加ボタン */}
            <TouchableOpacity
                className="w-full bg-orange-400 justify-center items-center py-4 rounded-full mb-3"
                onPress={() => handlePress('遊び')} // '遊び' タイプとして追加
            >
            <Text className="text-white font-bold text-lg">遊び追加</Text>
            </TouchableOpacity>

            {/* 仕事追加ボタン */}
            <TouchableOpacity
                className="w-full bg-blue-500 justify-center items-center py-4 rounded-full"
                onPress={() => handlePress('仕事')} // '仕事' タイプとして追加
            >
            <Text className="text-white font-bold text-lg">仕事追加</Text>
            </TouchableOpacity>
        </View>
    );
}

export default AddTaskScreen;

