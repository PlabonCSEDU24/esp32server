import React from 'react';
import {StatusBar, Box} from 'native-base';
import colors from '../constants/colors';

const Container = ({children}) => {
  return (
    <Box flex={1} bg="#fff" safeArea>
      <StatusBar barStyle="light-content" backgroundColor={colors.APP_BLUE} />
      {children}
    </Box>
  );
};

export default Container;
