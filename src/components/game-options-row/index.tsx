import React, { Component } from "react";
import { ListItem, Left, Button, Icon, Right, Text } from "native-base";
import { withNavigation } from "react-navigation";
import UserDataUtility from "../../utilities/user-data";

class GameOptionsRow extends Component<
  { plain: string; style: any; includeBorder: boolean; navigation?: any },
  { owned: boolean; watching: boolean }
> {
  private _willFocusSub: any;

  constructor(props) {
    super(props);

    const watchlist = UserDataUtility.getWatchlist();
    const ownedGames = UserDataUtility.getOwnedGames();

    this.state = {
      owned: ownedGames.includes(this.props.plain),
      watching: watchlist.includes(this.props.plain)
    };

    this._toggleOwned = this._toggleOwned.bind(this);
    this._toggleWatching = this._toggleWatching.bind(this);
    this._willFocus = this._willFocus.bind(this);
    this._willFocusSub = this.props.navigation.addListener(
      "willFocus",
      this._willFocus
    );
  }

  _willFocus() {
    const watchlist = UserDataUtility.getWatchlist();
    const ownedGames = UserDataUtility.getOwnedGames();

    this.setState({
      owned: ownedGames.includes(this.props.plain),
      watching: watchlist.includes(this.props.plain)
    });
  }

  componentWillUnmount() {
    this._willFocusSub && this._willFocusSub.remove();
  }

  render() {
    return (
      <ListItem
        style={[
          this.props.style.primary,
          { flexDirection: "row", maxHeight: 50 }
        ]}
        noBorder={!this.props.includeBorder}
      >
        <Left style={[this.props.style.primary, { flex: 0.5 }]}>
          <Button transparent onPress={this._toggleOwned}>
            <Text
              style={[
                this.props.style.primary,
                {
                  fontSize: 12,
                  color: this.state.owned
                    ? this.props.style.secondary.color
                    : this.props.style.primary.color,
                  textDecorationLine: this.state.owned ? "none" : "line-through"
                }
              ]}
            >
              {` Owned `}
            </Text>
            <Icon
              name={this.state.owned ? "checkcircle" : "checkcircleo"}
              type="AntDesign"
              style={{ color: this.props.style.primary.color, fontSize: 12 }}
            />
          </Button>
        </Left>
        <Right style={[this.props.style.primary, { flex: 0.5 }]}>
          <Button transparent onPress={this._toggleWatching}>
            <Text
              style={[
                this.props.style.primary,
                {
                  fontSize: 12,
                  color: this.state.watching
                    ? this.props.style.secondary.color
                    : this.props.style.primary.color,
                  textDecorationLine: this.state.watching
                    ? "none"
                    : "line-through"
                }
              ]}
            >
              {` Watching `}
            </Text>
            <Icon
              name={this.state.watching ? "eye" : "eye-off"}
              type={this.state.watching ? "Entypo" : "Feather"}
              style={{ color: this.props.style.primary.color, fontSize: 12 }}
            />
          </Button>
        </Right>
      </ListItem>
    );
  }

  async _toggleWatching() {
    const watching = await UserDataUtility.toggleGameInWatchlist(
      this.props.plain
    );
    this.setState({ watching });
  }

  async _toggleOwned() {
    const owned = await UserDataUtility.toggleGameOwned(this.props.plain);
    this.setState({ owned });
  }
}

export default withNavigation(GameOptionsRow);
