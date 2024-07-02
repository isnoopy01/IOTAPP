import React, {useEffect, useState} from 'react';
import {
  View,
  Switch,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import {images} from '../../assets/images/image';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';

const ShowLight = ({navigation}: {navigation: any}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const route = useRoute();
  const params = route.params as any;

  useEffect(() => {
    if (Number(params?.currentTem) >= Number(params?.temperatureToOpenFan)) {
      setIsEnabled(true);
    }
  }, [params]);
  return (
    <SafeAreaView
      style={{
        backgroundColor: 'white',
        flex: 1,
      }}>
      <View>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image style={styles.iconHeader} source={images.ArrowLeft} />
          </TouchableOpacity>
          <View style={styles.textHeaders}>
            <Text style={styles.textHeader}>Thiết bị</Text>
          </View>
          <Image style={styles.iconHeader} source={images.Null} />
        </View>
        <Image
          style={styles.lightImage}
          source={isEnabled ? images.LightOn : images.LightOff}
        />
        <View style={styles.control}>
          <Text style={{paddingTop: 10, fontSize: 18}}>
            {isEnabled ? 'Light is ON' : 'Light is OFF'}
          </Text>
          <Switch
            trackColor={{false: '#ffffff', true: '#F5DD4B'}}
            thumbColor={isEnabled ? '#ffffff' : '#F5F3F4'}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#E4E4E4',
    borderBottomWidth: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  iconHeader: {
    width: 25,
    height: 25,
  },
  textHeaders: {
    flexDirection: 'row',
  },
  textHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444444',
  },
  // container: {
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   backgroundColor: 'white',
  // },
  lightImage: {
    width: 400,
    height: 400,
    marginBottom: 10,
  },
  control: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
});

export default ShowLight;
