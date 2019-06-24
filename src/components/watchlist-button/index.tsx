import React, { Component } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Icon } from "native-base";
import { AsyncStorage, ToastAndroid } from "react-native";
import { uniq } from "lodash";

export default class WatchlistButton extends Component<
  { plain: string },
  { watching: boolean }
> {
  private _watchList: string[];

  constructor(props) {
    super(props);

    this.state = {
      watching: false
    };

    this._toggleWatch = this._toggleWatch.bind(this);
  }

  async componentDidMount() {
    this._watchList = await AsyncStorage.getItem(
      "watchlist",
      (err, res) => res
    ).then(res => (JSON.parse(res) as string[]) || []);

    if (this._watchList.includes(this.props.plain)) {
      this.setState({ watching: true });
    }
  }

  render() {
    return (
      <TouchableOpacity>
        <Button transparent light onPress={this._toggleWatch}>
          <Icon type="Feather" name={this.state.watching ? "eye-off" : "eye"} />
        </Button>
      </TouchableOpacity>
    );
  }

  async _toggleWatch() {
    let toastMessage = "";
    if (this.state.watching) {
      this._watchList = uniq(
        this._watchList.filter(l => l != this.props.plain)
      );
      toastMessage = "Removed from watchlist...";
    } else {
      this._watchList.push(this.props.plain);
      toastMessage = "Added to watchlist!";
    }

    await AsyncStorage.setItem("watchlist", JSON.stringify(this._watchList));

    this.setState({ watching: !this.state.watching });

    try {
      ToastAndroid.showWithGravity(
        toastMessage,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    } catch {}
  }
}
