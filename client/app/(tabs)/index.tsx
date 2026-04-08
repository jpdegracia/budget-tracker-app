import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Step 1 */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      {/* Step 2 */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app, or 
          <Link href="/explore" style={{ color: '#007AFF' }}> click here</Link> to jump there now.
        </ThemedText>
      </ThemedView>

      {/* Step 3 */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText> and start fresh.
        </ThemedText>
      </ThemedView>

      {/* Step 4 */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4: Style your components</ThemedText>
        <ThemedText>
          Open <ThemedText type="defaultSemiBold">constants/Colors.ts</ThemedText> to update your 
          theme colors and see how they apply to <ThemedText type="defaultSemiBold">ThemedView</ThemedText> and 
          <ThemedText type="defaultSemiBold">ThemedText</ThemedText>.
        </ThemedText>
      </ThemedView>

      {/* Step 5
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 5: Deploy your app</ThemedText>
        <ThemedText>
          Ready to share? Use <ThemedText type="defaultSemiBold">npx expo export</ThemedText> to 
          bundle your project for production or <ThemedText type="defaultSemiBold">eas build</ThemedText> 
          to create a native binary.
        </ThemedText>
      </ThemedView> */}

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 20, // Increased spacing for better readability
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});