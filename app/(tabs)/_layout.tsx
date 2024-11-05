import React, { memo } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Tabs } from "expo-router";
import AntDesign from "react-native-vector-icons/AntDesign"; 
import { StatusBar } from "expo-status-bar";
import { useRouter } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TabLayout = () => {
  const router = useRouter();
  const tabBarBackground = "#ffffff";
  const activeTintColor = "orange";
  const inactiveTintColor = "#8e8e93";

  const CustomTabBar = memo(({ state, descriptors, navigation }: BottomTabBarProps) => {
    return (
      <View style={[styles.tabBar, { backgroundColor: tabBarBackground }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = getAntDesignIconName(route.name);
          const iconColor = isFocused ? activeTintColor : inactiveTintColor;

          const labelText = typeof label === 'function' 
            ? label({ focused: isFocused, color: iconColor, position: 'below-icon', children: route.name })
            : label;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <AntDesign name={iconName} size={28} color={iconColor} />
              </View>
              <Text style={[styles.tabLabel, { color: iconColor }]}>
                {labelText}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  });

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ focused }) => (
              <AntDesign
                name="home"
                size={24}
                color={focused ? activeTintColor : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vocabulary"
          options={{
            title: "Từ vựng",
            tabBarIcon: ({ focused }) => (
              <AntDesign
                name="book"
                size={24}
                color={focused ? activeTintColor : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "ChatAI",
            tabBarIcon: ({ focused }) => (
              <AntDesign
                name="message1"
                size={24}
                color={focused ? activeTintColor : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dict"
          options={{
            title: "Từ điển",
            tabBarIcon: ({ focused }) => (
              <AntDesign
                size={24}
                color={focused ? activeTintColor : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Hồ sơ",
            tabBarIcon: ({ focused }) => (
              <AntDesign
                name="user"
                size={24}
                color={focused ? activeTintColor : inactiveTintColor}
              />
            ),
          }}
        />
      </Tabs>
      <StatusBar style="auto" />
      <TouchableOpacity
        style={styles.chatBotContainer}
        onPress={() => router.navigate("/chatwithai")}
      >
        {/* Loại bỏ LottieView */}
        <Text style={styles.chatBotText}>ChatBot</Text>
      </TouchableOpacity>
    </View>
  );
};

const getAntDesignIconName = (routeName: string): string => {
  switch (routeName) {
    case "home":
      return "home";
    case "vocabulary":
      return "book";
    case "chat":
      return "message1";
    case "dict":
      return "search1";
    case "profile":
      return "user";
    default:
      return "questioncircle";
  }
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 70,
    borderTopWidth: 0.5,
    borderTopColor: "#dcdcdc",
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 5,
    justifyContent: "space-around",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabLabel: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e3edaf",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  chatBotContainer: {
    position: "absolute",
    right: 10,
    bottom: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  chatBotText: {
    fontSize: 16,
    color: "orange",
    fontWeight: "600",
  },
});

export default TabLayout;
