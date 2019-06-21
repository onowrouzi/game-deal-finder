import React, { Component } from "react";
import { Container, Spinner } from "native-base";
import { Themes } from "../../services/themes";

export class LoadingScreen extends Component<{}, { style: any }> {
  constructor(props) {
    super(props);
    this.state = {
      style: {}
    };
  }

  async componentDidMount() {
    const style = Themes.getThemeStyles();
    this.setState({ style });
  }

  render() {
    return (
      <Container style={this.state.style.primary}>
        <Spinner />
      </Container>
    );
  }
}
