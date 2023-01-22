import React from 'react';
import {NativeBaseProvider, Text, Box} from 'native-base';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Main} from './src/screens';
export default function App() {
  return (
    <NativeBaseProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <Main />
      </GestureHandlerRootView>
    </NativeBaseProvider>
  );
}
