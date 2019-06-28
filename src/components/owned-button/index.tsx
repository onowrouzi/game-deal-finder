import React, { Component } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Icon } from "native-base";
import { ToastAndroid } from "react-native";
import UserDataUtility from "../../utilities/user-data";

export default class OwnedButton extends Component<
  { plain: string },
  { owned: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      owned: UserDataUtility.getOwnedGames().includes(this.props.plain)
    };

    this._toggleOwned = this._toggleOwned.bind(this);
  }

  render() {
    return (
      <TouchableOpacity>
        <Button transparent light onPress={this._toggleOwned}>
          <Icon
            type="AntDesign"
            name={this.state.owned ? "checkcircle" : "checkcircleo"}
          />
        </Button>
      </TouchableOpacity>
    );
  }

  async _toggleOwned() {
    const owned = await UserDataUtility.toggleGameOwned(this.props.plain);

    this.setState({ owned });

    const toastMessage = owned
      ? "Added to owned games list!"
      : "Removed from owned games list...";

    try {
      ToastAndroid.showWithGravity(
        toastMessage,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    } catch {}
  }
}
