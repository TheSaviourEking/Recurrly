import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView className='p-5 flex-1 bg-background'>
      <Text className='text-foreground text-2xl font-bold mb-6'>Settings</Text>

      <Pressable
        onPress={handleLogout}
        className='bg-destructive rounded-xl px-4 py-4 items-center'
      >
        <Text className='text-white font-semibold text-base'>Log Out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;