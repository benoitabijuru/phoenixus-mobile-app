import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";

const OnBoarding = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="w-full flex justify-end items-end p-5"
      >
        <Text className="text-black text-md font-JakartaBold">Skip</Text>
      </TouchableOpacity>

      <View className="flex-1">
        <Swiper
          ref={swiperRef}
          loop={false}
          dot={
            <View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
          }
          activeDot={
            <View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
          }
          onIndexChanged={(index) => setActiveIndex(index)}
          showsButtons={false}
          paginationStyle={styles.pagination}
        >
          {onboarding.map((item) => (
            <View key={item.id} className="flex-1 items-center justify-center px-8">
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />
              <Text 
                className="text-black font-bold text-center mt-6 px-4"
                style={styles.title}
              >
                {item.title}
              </Text>
              <Text 
                className="text-center text-[#858585] mt-3 px-8"
                style={styles.description}
              >
                {item.description}
              </Text>
            </View>
          ))}
        </Swiper>
      </View>

      <View className="px-5 pb-5">
        <CustomButton
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={() =>
            isLastSlide
              ? router.replace("/(auth)/sign-up")
              : swiperRef.current?.scrollTo(activeIndex + 1)
          }
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pagination: {
    bottom: 10,
  },
  image: {
    width: 220,
    height: 220,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default OnBoarding;