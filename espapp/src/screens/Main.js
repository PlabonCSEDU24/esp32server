import React, {useState, useRef, useEffect} from 'react';
import {
  Box,
  Button,
  ChevronRightIcon,
  HStack,
  Input,
  Pressable,
  SunIcon,
  Text,
} from 'native-base';
import {Touchpad} from '../components';
import Container from '../components/Container';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {TextInput} from 'react-native';

const Main = () => {
  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const ws = useRef(null);

  const setupSocket = () => {
    ws.current = new WebSocket('ws://192.168.4.1:81');
    ws.current.onopen = e => {
      setSocketConnected(true);
      setSocket(ws.current);
    };
    ws.current.onmessage = e => {
      console.log(JSON.parse(e.data));
    };

    ws.current.onclose = e => {
      console.log('disconnected');
      setSocketConnected(false);
      setSocket(null);
      setTimeout(setupSocket, 3000);
    };

    ws.current.onerror = e => {
      console.log(e);
      setSocketConnected(false);
      ws.current.close();
      setSocket(null);
    };
  };

  useEffect(() => {
    setupSocket();
    return () => {
      ws.current.close();
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.4.1/');
      const json = await response.json();
      console.log(json);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <Box bg="red.200" px="2">
        <HStack alignItems="center" py="3" space="2">
          <SunIcon size="5" color={socketConnected ? 'green.400' : 'red.400'} />
          <Text>
            SOCKET {`${socketConnected ? 'CONNECTED' : 'DISCONNECTED'}`}
          </Text>
        </HStack>
      </Box>
      <Box flex={1} mb="32" px="3" alignItems="center" justifyContent="center">
        {socket && <Touchpad socket={socket} />}
      </Box>

      <Box bottom={0} position="absolute" width="100%" height="32" bg="#282c34">
        <HStack position="relative" justifyContent="space-between">
          <Box
            mx="2"
            borderBottomWidth={1}
            borderBottomColor="#fff"
            alignSelf="flex-start">
            <Text fontWeight="400" color="#fff">
              TERMINAL
            </Text>
          </Box>
          <TouchableOpacity
            onPress={() => {
              socket && socket.send(JSON.stringify({term: text}));
            }}
            style={{
              top: -12,
              borderColor: '#282c34',
              borderWidth: 1,
            }}>
            <HStack pl="4" pr="3" py="2" bg="dark.700" alignItems="center">
              <Text fontWeight="600" color="#282c34">
                SEND
              </Text>
              <ChevronRightIcon color="#282c34" ml="1" />
            </HStack>
          </TouchableOpacity>
        </HStack>
        <Box>
          <TextInput
            multiline={true}
            numberOfLines={3}
            placeholderTextColor="#fff"
            placeholder="Write to usart..."
            cursorColor="#fff"
            style={{color: 'white', paddingLeft: 10}}
            value={text}
            onChangeText={val => {
              setText(val);
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default Main;
