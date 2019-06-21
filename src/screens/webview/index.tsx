import React, { Component } from "react";
import { WebView, WebViewUriSource } from "react-native";
import { LoadingScreen } from "../../components/loading-screen";
import { Themes } from "../../services/themes";

export default class WebViewScreen extends Component<
  { navigation: any },
  { source: WebViewUriSource; style: any }
> {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`
  });
  constructor(props) {
    super(props);

    const uri = this.props.navigation.getParam("uri", "");
    this.state = { source: { uri }, style: {} };
  }

  async componentDidMount() {
    const style = Themes.getThemeStyles();
    this.setState({ style });
  }

  render() {
    return (
      <WebView
        source={this.state.source}
        style={{
          backgroundColor: this.state.style.primary
            ? this.state.style.backgroundColor
            : "#333"
        }}
        renderLoading={() => <LoadingScreen />}
        startInLoadingState
      />
    );
  }
}
