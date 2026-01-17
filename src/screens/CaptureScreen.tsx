import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeFood } from '../services/gemini';
import { saveMeal } from '../services/meals';

interface Props {
  navigation: any;
}

export default function CaptureScreen({ navigation }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      await processImage(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      await processImage(result.assets[0].base64);
    }
  };

  const processImage = async (base64: string) => {
    setAnalyzing(true);
    try {
      // Analyze with Gemini
      const analysis = await analyzeFood(base64);

      // Check if it's a late meal
      const hour = new Date().getHours();
      if ((hour >= 21 || hour < 5) && !analysis.flags.includes('late_meal')) {
        analysis.flags.push('late_meal');
      }

      // Save to Firestore
      await saveMeal(
        'demo_user',
        analysis.foods,
        analysis.flags,
        analysis.estimated_nutrition,
        base64
      );

      setSuccess(true);

      // Navigate back after showing success
      setTimeout(() => {
        navigation.goBack();
      }, 1500);

    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to analyze meal. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>Meal Logged</Text>
          <Text style={styles.successSubtext}>Data captured. Forget about it.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log Meal</Text>
      </View>

      {analyzing ? (
        <View style={styles.analyzingContainer}>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
          <ActivityIndicator size="large" color="#4A90A4" style={styles.loader} />
          <Text style={styles.analyzingText}>Analyzing your meal...</Text>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          <Text style={styles.instruction}>Capture your meal</Text>
          <Text style={styles.subInstruction}>We'll remember so you don't have to</Text>

          <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
            <Text style={styles.optionIcon}>📸</Text>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
            <Text style={styles.optionIcon}>🖼️</Text>
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    color: '#58A6FF',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 20,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instruction: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subInstruction: {
    fontSize: 16,
    color: '#8B949E',
    marginBottom: 40,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262D',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  loader: {
    marginBottom: 16,
  },
  analyzingText: {
    fontSize: 18,
    color: '#8B949E',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 80,
    color: '#238636',
    marginBottom: 20,
  },
  successText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: '#8B949E',
  },
});
