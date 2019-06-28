import React, { Component } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Icon } from "native-base";
import { ToastAndroid } from "react-native";
import UserDataUtility from "../../utilities/user-data";

export default class WatchlistButton extends Component<
  { plain: string },
  { watching: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      watching: UserDataUtility.getWatchlist().includes(this.props.plain)
    };

    this._toggleWatch = this._toggleWatch.bind(this);
  }

  render() {
    return (
      <TouchableOpacity>
        <Button transparent light onPress={this._toggleWatch}>
          <Icon
            type={this.state.watching ? "Entypo" : "Feather"}
            name={this.state.watching ? "eye" : "eye-off"}
          />
        </Button>
      </TouchableOpacity>
    );
  }

  async _toggleWatch() {
    const watching = await UserDataUtility.toggleGameInWatchlist(
      this.props.plain
    );

    this.setState({ watching });

    const toastMessage = watching
      ? "Added to watchlist!"
      : "Removed from watchlist...";

    try {
      ToastAndroid.showWithGravity(
        toastMessage,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    } catch {}
  }
}
