import React, { Component } from "react";
import { WebView, WebViewUriSource, BackHandler } from "react-native";
import { LoadingScreen } from "../../components/loading-screen";
import { Themes } from "../../services/themes";

export default class WebViewScreen extends Component<
  { navigation: any },
  { source: WebViewUriSource; style: any }
> {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`
  });

  private _canGoBack: boolean;
  private _ref: any;

  constructor(props) {
    super(props);

    const uri = this.props.navigation.getParam("uri", "");
    this.state = { source: { uri }, style: Themes.getThemeStyles() };

    this._canGoBack = false;
    this._onBackPress = this._onBackPress.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this._onBackPress);
  }

  _onBackPress = () => {
    if (this._canGoBack && this._ref) {
      this._ref.goBack();
      return true;
    }
    return false;
  };

  render() {
    return (
      <WebView
        ref={webview => {
          this._ref = webview;
        }}
        source={this.state.source}
        style={{
          backgroundColor: this.state.style.primary
            ? this.state.style.backgroundColor
            : "#333"
        }}
        renderLoading={() => <LoadingScreen />}
        onNavigationStateChange={navState => {
          this._canGoBack = navState && navState.canGoBack;
        }}
        startInLoadingState
      />
    );
  }
}
