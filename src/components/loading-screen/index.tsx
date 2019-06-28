import React, { Component } from "react";
import { Container, Spinner } from "native-base";
import ThemesUtility from "../../utilities/themes";

export default class LoadingScreen extends Component<{}, { style: any }> {
  constructor(props) {
    super(props);
    this.state = {
      style: ThemesUtility.getThemeStyles()
    };
  }

  render() {
    return (
      <Container style={this.state.style.primary}>
        <Spinner />
      </Container>
    );
  }
}
