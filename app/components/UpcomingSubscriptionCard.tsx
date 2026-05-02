import { formatCurrency } from '@/lib/utils'
import React from 'react'
import { Image, Text, View } from 'react-native'

const UpcomingSubscriptionCard = ({ name, price, daysLeft, icon, currency}: UpcomingSubscription) => {
  return (
    <View className='upcoming-card'>
      <Text className='upcoming-row'>
        <Image source={icon} className="upcoming-icon"/>
        <View>
            <Text className='upcoming-price'>{formatCurrency(price, currency)}</Text>
            <Text className='upcoming-meta' numberOfLines={1}>{daysLeft > 1 ? `${daysLeft} days left`: "Last day"} days left</Text>
        </View>
      </Text>

      <Text className='upcoming-name' numberOfLines={1}>{name}</Text>
    </View>
  )
}

export default UpcomingSubscriptionCard;