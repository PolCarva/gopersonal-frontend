import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type ProfileIconNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Products'>;

export function ProfileIcon() {
  const navigation = useNavigation<ProfileIconNavigationProp>();

  const handlePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons name="person-outline" size={24} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 10,
  },
}); 