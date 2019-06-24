import React, { Component } from "react";
import { View, Button, Text } from "native-base";
import { Dimensions } from "react-native";

export default class EmptyListView extends Component<
  { style: any; message: string; linkMessage: string; linkAction: () => any },
  {}
> {
  private _height: number;

  constructor(props) {
    super(props);

    this._height = Dimensions.get("screen").height;
  }
  render() {
    return (
      <View style={{ marginTop: this._height / 3 }}>
        <Text
          style={[
            this.props.style.primary,
            { textAlign: "center", fontSize: 20 }
          ]}
        >
          {this.props.message}
        </Text>
        <Button transparent full>
          <Text
            uppercase={false}
            style={[this.props.style.link, { fontSize: 20 }]}
            onPress={() => this.props.linkAction()}
          >
            {this.props.linkMessage}
          </Text>
        </Button>
      </View>
    );
  }
}
