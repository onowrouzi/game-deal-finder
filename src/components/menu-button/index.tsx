import React, { Component } from "react";
import { Button, Icon } from "native-base";
import { TouchableOpacity } from "react-native-gesture-handler";

export default class MenuButton extends Component<{ navigation: any }, {}> {
  render() {
    return (
      <TouchableOpacity>
        <Button
          transparent
          light
          onPress={() => this.props.navigation.toggleDrawer()}
        >
          <Icon name="menu" />
        </Button>
      </TouchableOpacity>
    );
  }
}
