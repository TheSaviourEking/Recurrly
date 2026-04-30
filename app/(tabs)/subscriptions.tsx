import { styled } from 'nativewind';
import { Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  return (
    <SafeAreaView className='p-5 flex-1 bg-background'>
      <Text>subscriptions</Text>
    </SafeAreaView>
  )
}

export default Subscriptions