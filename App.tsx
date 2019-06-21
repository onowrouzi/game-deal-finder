import React, { Component } from "react";
import {
  createAppContainer,
  createDrawerNavigator,
  createStackNavigator
} from "react-navigation";
import { Icon } from "native-base";

import DealsScreen from "./src/screens/deals";
import WebViewScreen from "./src/screens/webview";
import GameInfoScreen from "./src/screens/game-info";
import SettingsScreen from "./src/screens/settings";
import AboutScreen from "./src/screens/about";
import { Screens } from "./src/screens";
import { Image, Dimensions } from "react-native";
import SettingsUtility from "./src/services/settings";
import { Themes } from "./src/services/themes";

const SPLASH = require("./assets/splash.png");

export class InitialLoadingScreen extends Component<{ navigation: any }, {}> {
  static navigationOptions = {
    header: null
  };

  private _width: number;
  private _height: number;

  constructor(props) {
    super(props);

    const dims = Dimensions.get("screen");
    this._width = dims.width;
    this._height = dims.height;
  }

  async componentDidMount() {
    await Themes.init();
    await SettingsUtility.init();

    this.props.navigation.navigate(Screens.Deals);
  }

  render() {
    return (
      <Image
        source={require("./assets/splash.png")}
        style={{
          width: this._width,
          height: this._height,
          backgroundColor: "#333"
        }}
      />
    );
  }
}

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
    [Screens.Settings]: {
      screen: SettingsScreen
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
      inactiveTintColor: "#aaaaaa",
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
    defaultNavigationOptions
  }
);

export default (() => createAppContainer(AppStackNavigator))();
