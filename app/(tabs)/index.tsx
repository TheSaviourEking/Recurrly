import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from 'nativewind';
import { useMemo, useState } from "react";
import { FlatList, Image, Platform, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import ListHeading from "../components/ListHeading";
import SubscriptionCard from "../components/SubscriptionCard";
import UpcomingSubscriptionCard from "../components/UpcomingSubscriptionCard";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string|null>();
  const posthog = usePostHog();

    const ListHeader = useMemo(() => (
    <>
      <View className="home-header">
        <View className="home-user">
          <Image source={images.Avatar} className="home-avatar" />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>
        <Image source={icons.add} className="home-add-icon" />
      </View>

      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
          <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}</Text>
        </View>
      </View>

      <View className="mb-5">
        <ListHeading title="Upcoming" />
        <FlatList
          data={UPCOMING_SUBSCRIPTIONS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No Upcoming renewals yet.</Text>}
          renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
        />

        {/* {UPCOMING_SUBSCRIPTIONS.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-1"
          >
            {UPCOMING_SUBSCRIPTIONS.map((item) => (
              <UpcomingSubscriptionCard key={item.id} {...item} />
            ))}
          </ScrollView>
        ) : (
          <Text className="home-empty-state text-muted-foreground mt-2">No upcoming renewals yet.</Text>
        )} */}
      </View>

      <ListHeading title="All Subscriptions" />
    </>
  ), []);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
        <FlatList
          ListHeaderComponent={ListHeader}
          data={HOME_SUBSCRIPTIONS}
          keyExtractor={item => item.id}
          nestedScrollEnabled={Platform.OS === "android"}
          renderItem={({item})=> {
            return (
              <SubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() => {
                  const isExpanding = expandedSubscriptionId !== item.id;
                  setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id);
                  if (isExpanding) {
                    posthog.capture('subscription_card_expanded', {
                      subscription_id: item.id,
                      subscription_name: item.name,
                      category: item.category,
                      billing: item.billing,
                    });
                  }
                }}
              />
            )
          }}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={()=> <View className="h-4"></View>}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
          contentContainerClassName="pb-16"
        />
    </SafeAreaView>
  );
}