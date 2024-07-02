import React, {useEffect, useState} from 'react';
// import {useNavigation} from '@react-navigation/native';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  ImageBackground,
} from 'react-native';
import {images} from '../../assets/images/image';
import {createClient} from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';
import {Weather} from './weather';
import axios from 'axios';
import {PERMISSIONS, request} from 'react-native-permissions';

const InputData = ({navigation}: {navigation: any}) => {
  // const navigation = useNavigation();
  const [temperature, setTemperature] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [temperatureToOpenFan, setTemperatureToOpenFan] = useState('');
  const [position, setPosition] = useState<Geolocation.GeoPosition>();
  const [weather, setWeather] = useState<
    Array<{
      time: string;
      temperature: number;
    }>
  >();
  const [currentWeather, setCurrentWeather] = useState<{
    time: string;
    temperature: number;
  }>();
  const supabaseUrl = 'https://atamzgfzgyynoqqdnbup.supabase.co';
  const supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0YW16Z2Z6Z3l5bm9xcWRuYnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkyOTg0NDEsImV4cCI6MjAzNDg3NDQ0MX0.Ner2Wvuop0mILVgNkhI_Q0_XNgzC32pKRTkAhQlWA2I';
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      detectSessionInUrl: false,
    },
  });

  const fetchData = async () => {
    const {data, error} = await supabase
      .schema('public')
      .from('ocd')
      .select('*')
      .order('id', {ascending: false})
      .limit(1);

    if (error) {
      console.error(error);
    } else {
      console.log('Data', data);
      setTemperatureToOpenFan(data[0].value);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const channels = supabase
      .channel('custom-all-channel1')
      .on(
        'postgres_changes',
        {event: '*', schema: 'public', table: 'temperature'},
        payload => {
          console.log('Change received!', payload);
          fetchData();
        },
      )
      .subscribe();
    return () => {
      channels.unsubscribe();
    };
    // return channels.unsubscribe();
  }, []);

  const handleTemperatureInput = (text: React.SetStateAction<string>) => {
    setTemperature(text);
  };
  const handleSubmit = () => {
    setDisplayText(`${temperature} cd`);
  };
  // const goToShowLight = () => {
  //   navigation.navigate('ShowLight' as never);
  // };

  useEffect(() => {
    getLocation();
  }, []);
  useEffect(() => {
    handleCalculateCurrentTemperature();
  }, [weather]);

  const getWeather = async (lat: number, long: number) => {
    const params = {
      latitude: lat,
      longitude: long,
      hourly: 'temperature_2m',
      forecast_days: 1,
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
    try {
      const responses = await axios.get(url, {
        params,
      });
      const res = responses.data as Weather;
      const data: Array<{
        time: string;
        temperature: number;
      }> = [];
      res.hourly.time.forEach((item, index) => {
        data.push({
          time: moment(item).format('HH:mm'),
          temperature: res.hourly.temperature_2m[index],
        });
      });
      return data;
    } catch (error) {
      console.table('err', error);
    }
  };

  const handleCalculateCurrentTemperature = async () => {
    let currentHours = moment().hours();
    let currentMinutes = moment().minutes();
    const hours =
      currentMinutes > 30 ? `${currentHours + 1}:00` : `${currentHours}:00`;
    const currentTemp = weather?.find(item => item.time === hours);
    if (!!currentTemp) {
      setDisplayText(currentTemp?.temperature.toString() + '°C');
      setCurrentWeather(currentTemp as any);
    }
  };

  const getLocation = async () => {
    request(PERMISSIONS.IOS.LOCATION_ALWAYS).then(result => {
      console.log('result', result);
    });
    Geolocation.getCurrentPosition(
      async position => {
        console.log(position);
        setPosition(position);
        const weather = await getWeather(
          position.coords.latitude,
          position.coords.longitude,
        );
        console.log('weather', weather);
        setWeather(weather);
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const handleGotoChart = () => {
    const chartData: Array<any> = [];
    weather?.forEach((item, index) => {
      if (
        index === 0 ||
        index === 4 ||
        index === 8 ||
        index === 12 ||
        index === 16 ||
        index === 20 ||
        index === 23
      ) {
        chartData.push(item);
      }
    });
    navigation.navigate('Chart', {
      currentWeather: currentWeather,
      weather: weather,
      chartData: chartData,
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={images.BackgroundTop}
        resizeMode="stretch"
        style={styles.imageBackground}>
        <View style={styles.header}>
          <Text style={styles.textdisplay}>Current position :</Text>
          <Text style={styles.textdisplay}>
            Latitude : {position?.coords.latitude}, Longitude :{' '}
            {position?.coords.longitude}
          </Text>
          <Text style={styles.headerText}>
            Ngưỡng tự động bật : {temperatureToOpenFan}
          </Text>

          <Text style={styles.headerText}>Cường độ ánh</Text>
          <Text style={styles.headerText}>sáng hiện tại là: </Text>
        </View>
      </ImageBackground>
      {/* <Text style={styles.textdisplay}>Cường độ ánh sáng hiện tại là: </Text> */}
      <View style={styles.frameColor}>
        <ImageBackground
          source={images.Daimau}
          resizeMode="contain"
          style={styles.color}>
          <View>
            <Text style={styles.circleText}>{displayText || '0cd'}</Text>
          </View>
        </ImageBackground>
      </View>

      {/* <View style={styles.circle}>
        <Text style={styles.circleText}>{displayText || '0 cd'}</Text>
      </View>
      <Image style={styles.color} source={images.Daimau} /> */}
      <View style={styles.inputContainer}>
        {/* <TextInput
          style={styles.input}
          placeholder="Nhập cường độ ánh sáng"
          value={temperature}
          onChangeText={handleTemperatureInput}
          keyboardType="numeric"
        /> */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Xác nhận</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button1}
          onPress={() => {
            navigation.navigate('ShowLight', {
              temperatureToOpenFan: temperatureToOpenFan,
              currentTem: temperature,
            });
          }}>
          <Text style={styles.buttonText1}>Thiết bị</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleGotoChart}>
          <Text style={styles.buttonText}>Chart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    // alignItems: 'center',
  },
  imageBackground: {
    width: 400,
    height: 325,
    resizeMode: 'stretch',
  },
  textdisplay: {
    fontSize: 18,
  },
  // circle: {
  //   marginTop: 30,
  //   backgroundColor: 'white',
  //   borderRadius: 200,
  //   width: 300,
  //   height: 300,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   elevation: 4,
  //   shadowOffset: {width: 0, height: 2},
  //   shadowColor: 'black',
  //   shadowOpacity: 0.25,
  //   shadowRadius: 4.84,
  // },
  frameColor: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  color: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#555555',
    textAlign: 'center',
    padding: 20,
  },
  header: {
    padding: 30,
    marginTop: 60,
    // justifyContent: 'center',
    // alignItems: 'center',
    // marginBottom: 50,
  },
  headerText: {
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 30,
    fontSize: 15,
    color: '#838383',
    // width: '85%',
    // alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    // borderColor: '#ccc',
    // borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F5F3F4',
    marginBottom: 30,
    marginTop: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FBB03B',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button1: {
    marginTop: 5,
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#FBB03B',
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText1: {
    color: '#FBB03B',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InputData;
