import React from "react";
import {
  createAppContainer,
  createDrawerNavigator,
  createStackNavigator
} from "react-navigation";
import { Icon } from "native-base";

import InitialLoadingScreen from "./src/screens/initial-loading-screen";
import DealsScreen from "./src/screens/deals";
import WebViewScreen from "./src/screens/webview";
import GameInfoScreen from "./src/screens/game-info";
import SettingsScreen from "./src/screens/settings";
import AboutScreen from "./src/screens/about";
import { Screens } from "./src/screens";
import WatchlistScreen from "./src/screens/watchlist";

const defaultNavigationOptions = ({ navigation }) => ({
  headerStyle: {
    backgroundColor: "#212121"
  },
  headerTintColor: "#fff",
  title: navigation.state.routeName,
  cardStyle: {
    backgroundColor: "#333"
  }
});

const DealsStackNavigator = createStackNavigator(
  {
    [Screens.Deals]: {
      screen: DealsScreen
    },
    [Screens.GameInfo]: {
      screen: GameInfoScreen
    },
    [Screens.Webview]: {
      screen: WebViewScreen
    }
  },
  {
    defaultNavigationOptions
  }
);

const WatchlistStackNavigator = createStackNavigator(
  {
    [Screens.Watchlist]: {
      screen: WatchlistScreen
    },
    [Screens.GameInfo]: {
      screen: GameInfoScreen
    },
    [Screens.Webview]: {
      screen: WebViewScreen
    }
  },
  {
    defaultNavigationOptions
  }
);

const SettingsStackNavigator = createStackNavigator(
  {
    [Screens.Settings]: {
      screen: SettingsScreen
    }
  },
  {
    defaultNavigationOptions
  }
);

const AboutStackNavigator = createStackNavigator(
  {
    [Screens.About]: {
      screen: AboutScreen
    },
    [Screens.Webview]: {
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
    Watchlist: {
      screen: WatchlistStackNavigator,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <Icon
            name="eye"
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
    initialRouteName: Screens.Deals,
    drawerBackgroundColor: "#212121",
    contentOptions: {
      activeTintColor: "white",
      inactiveTintColor: "#aaa",
      labelStyle: {
        fontSize: 20
      }
    }
  }
);

const AppStackNavigator = createStackNavigator(
  {
    [Screens.Initial]: {
      screen: InitialLoadingScreen,
      navigationOptions: {
        header: null
      }
    },
    Drawer: {
      screen: MyDrawerNavigator,
      navigationOptions: {
        header: null
      }
    }
  },
  {
    cardStyle: {
      backgroundColor: "#333"
    },
    defaultNavigationOptions
  }
);

export default (() => createAppContainer(AppStackNavigator))();
