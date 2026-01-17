import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../utils/haptics';
import { Card, Text as ThemedText } from '../components';
import { Button } from '../components/Button';
import { storage } from '../config/firebase';
import { SPACING } from '../config/designSystem';

interface Props {
  navigation: any;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export default function BloodWorkUploadScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { user } = useAuth();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    haptics.light();
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;
    setFile(result.assets[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      Alert.alert('No File', 'Please select a PDF or image first.');
      return;
    }

    setUploading(true);
    haptics.light();

    try {
      const userId = user?.uid || 'demo_user';
      const safeName = file.name?.replace(/\s+/g, '_') || `bloodwork_${Date.now()}`;
      const storageRef = ref(storage, `bloodwork/${userId}/${Date.now()}_${safeName}`);

      const response = await fetch(file.uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      const record: UploadedFile = {
        id: Date.now().toString(),
        name: file.name || 'bloodwork',
        url,
        uploadedAt: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem('bloodwork_files');
      const all: UploadedFile[] = existing ? JSON.parse(existing) : [];
      all.unshift(record);
      await AsyncStorage.setItem('bloodwork_files', JSON.stringify(all));

      haptics.success();
      Alert.alert('Uploaded', 'Your file was uploaded successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      haptics.error();
      Alert.alert('Upload Failed', 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <Icon name="arrow-left" size={20} color={colors.primary} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText variant="headlineSmall" color="primary">Upload Blood Work</ThemedText>
            <ThemedText variant="bodySmall" color="muted" style={styles.subtitle}>
              PDF or image of lab results
            </ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          <Card variant="secondary" style={styles.dropZone}>
            <Icon name="file-upload-outline" size={36} color={colors.primary} />
            <ThemedText variant="bodyMedium" color="muted" style={{ marginTop: SPACING.sm }}>
              {file ? file.name : 'Select a PDF or image'}
            </ThemedText>
            <ThemedText variant="labelSmall" color="soft" style={{ marginTop: 4 }}>
              Max size depends on device + network
            </ThemedText>
          </Card>

          <View style={styles.actions}>
            <Button title="Choose File" variant="outline" onPress={pickFile} />
            <Button title="Upload" onPress={uploadFile} loading={uploading} />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
    gap: SPACING.lg,
  },
  dropZone: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  actions: {
    gap: SPACING.sm,
  },
});
