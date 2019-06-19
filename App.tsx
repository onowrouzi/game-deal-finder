import React from "react";
import {
  createAppContainer,
  createDrawerNavigator,
  createStackNavigator
} from "react-navigation";
import { Icon } from "native-base";

import DealsScreen from "./src/screens/deals";
import WebViewScreen from "./src/screens/webview";
import MenuButton from "./src/components/menu-button";
import GameInfoScreen from "./src/screens/game-info";
import SettingsScreen from "./src/screens/settings";
import SettingsButton from "./src/components/settings-button";
import AboutScreen from "./src/screens/about";

const defaultNavigationOptions = ({ navigation }) => ({
  headerStyle: {
    backgroundColor: "#212121"
  },
  headerTintColor: "#fff",
  title: navigation.state.routeName
});

const DealsStackNavigator = createStackNavigator(
  {
    Deals: {
      screen: DealsScreen,
      navigationOptions: ({ navigation }) => ({
        headerLeft: <MenuButton navigation={navigation} />,
        headerRight: <SettingsButton navigation={navigation} />
      })
    },
    Settings: {
      screen: SettingsScreen
    },
    GameInfo: {
      screen: GameInfoScreen,
      navigationOptions: ({ navigation }) => ({
        title: `${navigation.state.params.title}`
      })
    },
    Webview: {
      screen: WebViewScreen,
      navigationOptions: ({ navigation }) => ({
        title: `${navigation.state.params.title}`
      })
    }
  },
  {
    defaultNavigationOptions
  }
);

const SettingsStackNavigator = createStackNavigator(
  {
    Settings: {
      screen: SettingsScreen,
      navigationOptions: ({ navigation }) => ({
        headerLeft: <MenuButton navigation={navigation} />
      })
    }
  },
  {
    defaultNavigationOptions
  }
);

const AboutStackNavigator = createStackNavigator(
  {
    About: {
      screen: AboutScreen,
      navigationOptions: ({ navigation }) => ({
        headerLeft: <MenuButton navigation={navigation} />
      })
    },
    WebView: {
      screen: WebViewScreen
    }
  },
  {
    defaultNavigationOptions
  }
);

const MyDrawerNavigator = createDrawerNavigator(
  {
    Deals: {
      screen: DealsStackNavigator,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <Icon
            name="dollar-sign"
            type="Feather"
            style={{ color: tintColor, fontSize: 20 }}
          />
        )
      }
    },
    Settings: {
      screen: SettingsStackNavigator,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <Icon
            name="settings"
            type="Feather"
            style={{ color: tintColor, fontSize: 20 }}
          />
        )
      }
    },
    About: {
      screen: AboutStackNavigator,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <Icon
            name="info"
            type="Feather"
            style={{ color: tintColor, fontSize: 20 }}
          />
        )
      }
    }
  },
  {
    initialRouteName: "Deals",
    drawerBackgroundColor: "#212121",
    contentOptions: {
      activeTintColor: "white",
      inactiveTintColor: "#aaaaaa",
      labelStyle: {
        fontSize: 20
      }
    }
  }
);

export default (() => createAppContainer(MyDrawerNavigator))();
