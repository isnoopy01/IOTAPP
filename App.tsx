import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import ShowLight from './src/screen/showLight/showLight';
import InputData from './src/screen/screens/light';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="InputData" component={InputData} />
        <Stack.Screen name="ShowLight" component={ShowLight} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
