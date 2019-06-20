import React, { Component } from "react";
import { WebView, WebViewUriSource } from "react-native";
import { View, Spinner, Content } from "native-base";

export default class WebViewScreen extends Component<
  { navigation: any },
  { source: WebViewUriSource }
> {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`
  });

  constructor(props) {
    super(props);

    const uri = this.props.navigation.getParam("uri", "");
    this.state = { source: { uri } };
  }

  render() {
    return (
      <WebView
        source={this.state.source}
        renderLoading={() => <Spinner />}
        startInLoadingState
      />
    );
  }
}
