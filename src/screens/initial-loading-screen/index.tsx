import React, { Component } from "react";
import { Dimensions, Image, AppState, BackHandler, Alert } from "react-native";
import { Themes } from "../../services/themes";
import SettingsUtility from "../../services/settings";
import { Screens } from "..";

const SPLASH = require("./../../../assets/splash.png");

export default class InitialLoadingScreen extends Component<
  { navigation: any },
  {}
> {
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
    await this.loadApp();
  }

  async loadApp() {
    await Themes.init();
    await SettingsUtility.init();

    this.props.navigation.navigate(Screens.Deals);
  }

  render() {
    return (
      <Image
        source={SPLASH}
        style={{
          width: this._width,
          height: this._height,
          backgroundColor: "#333"
        }}
      />
    );
  }
}
