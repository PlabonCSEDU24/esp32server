import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {debounce} from 'lodash';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import {PanGestureHandler} from 'react-native-gesture-handler';

const SIZE = 40;
const CIRCLE_RADIUS = SIZE * 2.6;

const Touchpad = ({socket}) => {
  const [coords, setCoords] = useState({x: 0, y: 0});

  const sendCoords = coords => {
    socket.send(JSON.stringify({term: '', x: coords.x, y: coords.y}));
  };
  //const handler = useCallback(debounce(sendCoords, 10), []);

  const setValue = coords => {
    var roundx = Math.round(coords.x);
    var roundy = Math.round(coords.y);
    setCoords({
      x: roundx,
      y: -roundy,
    });
    sendCoords({
      x: roundx,
      y: -roundy,
    });
  };

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGestureEvent = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.translateX = translateX.value;
      context.translateY = translateY.value;
    },
    onActive: (event, context) => {
      const distance = Math.sqrt(translateX.value ** 2 + translateY.value ** 2);
      translateX.value = event.translationX + context.translateX;
      translateY.value = event.translationY + context.translateY;
      if (distance < CIRCLE_RADIUS) {
        runOnJS(setValue)({
          x: translateX.value,
          y: translateY.value,
        });
      }
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      runOnJS(setValue)({
        x: 0,
        y: 0,
      });
    },
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  return (
    <View>
      <View style={styles.circle}>
        <PanGestureHandler onGestureEvent={panGestureEvent}>
          <Animated.View style={[styles.square, rStyle]} />
        </PanGestureHandler>
      </View>
      <View style={{flexDirection: 'row'}}>
        <Text style={{width: 50}}>
          <Text style={{color: 'red', fontSize: 12}}>x: </Text>
          {coords.x}
        </Text>
        <Text>
          <Text style={{color: 'green', fontSize: 12}}>y: </Text>
          {coords.y}
        </Text>
      </View>
    </View>
  );
};

export default Touchpad;

const styles = StyleSheet.create({
  square: {
    width: SIZE,
    height: SIZE,
    backgroundColor: 'rgba(40,44,52,0.3)',
    borderRadius: 10,
  },
  circle: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4b5563',
    borderRadius: 4,
  },
});
