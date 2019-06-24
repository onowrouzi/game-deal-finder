import React, { Component } from "react";
import { Button, Icon } from "native-base";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "../../screens";

export default class SettingsButton extends Component<{ navigation: any }, {}> {
  render() {
    return (
      <TouchableOpacity>
        <Button
          transparent
          light
          onPress={() => {
            this.props.navigation.navigate(Screens.Settings);
          }}
        >
          <Icon name="settings" />
        </Button>
      </TouchableOpacity>
    );
  }
}
