import React, { Component } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Icon } from "native-base";

export default class RefreshButton extends Component<
  { refresh: () => any },
  {}
> {
  render() {
    return (
      <TouchableOpacity>
        <Button transparent light onPress={() => this.props.refresh()}>
          <Icon name="refresh" />
        </Button>
      </TouchableOpacity>
    );
  }
}
