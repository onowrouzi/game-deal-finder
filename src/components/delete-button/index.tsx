import React, { Component } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Icon } from "native-base";

export default class DeleteButton extends Component<
  { onPress: () => any },
  {}
> {
  render() {
    return (
      <TouchableOpacity>
        <Button transparent light onPress={this.props.onPress}>
          <Icon name="trash-2" type="Feather" />
        </Button>
      </TouchableOpacity>
    );
  }
}
