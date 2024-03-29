import React, { Component } from "react";
import LoadingScreen from "../../components/loading-screen";
import { IsThereAnyDealApi, ItadDealFull } from "itad-api-client-ts";
import { API_KEY } from "react-native-dotenv";
import { Container, Icon, Button } from "native-base";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "../../types/screens";
import ThemesUtility from "../../utilities/themes";
import MenuButton from "../../components/menu-button";
import { Settings } from "../../types/settings";
import SettingsUtility from "../../utilities/settings";
import DealItemListView from "../../components/deal-item-list-view";
import DealItemCardView from "../../components/deal-item-card-view";
import EmptyListView from "../../components/empty-list-view";
import DeleteButton from "../../components/delete-button";
import UserDataUtility from "../../utilities/user-data";
import { Alert } from "react-native";

export default class WatchlistScreen extends Component<
  { navigation: any },
  { style: any; loading: boolean; refreshing: boolean; list: ItadDealFull[] }
> {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: <MenuButton navigation={navigation} />,
    headerRight: (
      <DeleteButton
        onPress={() => {
          navigation.state.params.clearList();
        }}
      />
    )
  });

  private _api: IsThereAnyDealApi;
  private _watchlist: string[];
  private _willFocusSub: any;
  private _settings: Settings;

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      refreshing: false,
      list: [],
      style: ThemesUtility.getThemeStyles()
    };
    this._api = new IsThereAnyDealApi(API_KEY);
    this._settings = SettingsUtility.getSettings();

    this._clearList = this._clearList.bind(this);
    this._willFocus = this._willFocus.bind(this);
    this._willFocusSub = this.props.navigation.addListener(
      "willFocus",
      this._willFocus
    );
  }

  async componentDidMount() {
    this.props.navigation.setParams({ clearList: this._clearList });
  }

  async _willFocus() {
    this.setState({ style: ThemesUtility.getThemeStyles() });
    await this._getWatchlist();
  }

  componentWillUnmount() {
    this._willFocusSub && this._willFocusSub.remove();
  }

  render() {
    return this.state.loading ? (
      <LoadingScreen />
    ) : (
      <Container style={this.state.style.primary}>
        <FlatList
          data={this.state.list}
          onRefresh={async () => await this._getWatchlist()}
          refreshing={this.state.refreshing}
          renderItem={({ item }) => this._getListItemComponent(item)}
          keyExtractor={(item, index) => item.title}
          ListEmptyComponent={() => (
            <EmptyListView
              message="Your watchlist is empty!"
              linkMessage="Wanna check out some deals?"
              linkAction={() => this.props.navigation.navigate(Screens.Deals)}
              style={this.state.style}
            />
          )}
        />
      </Container>
    );
  }

  async _clearList() {
    Alert.alert(
      "Are you sure?",
      "Would you like empty your watchlist?",
      [
        { text: "NO", onPress: () => {} },
        {
          text: "YES",
          onPress: async () => {
            await UserDataUtility.setWatchlist([]);
            await this._getWatchlist();
          }
        }
      ],
      {
        cancelable: false
      }
    );
  }

  async _getWatchlist() {
    this._watchlist = UserDataUtility.getWatchlist();

    let list = [];

    if (this._watchlist && this._watchlist.length > 0) {
      const gamesInfo = await this._api.getGameInfo(this._watchlist);
      const prices = await this._api.getGamePrices({
        plains: this._watchlist,
        shops: this._settings.shops,
        region: this._settings.region,
        country: this._settings.country
      });
      list = gamesInfo
        ? Object.keys(gamesInfo)
            .filter(key => key)
            .map(key => {
              const bestPrice = prices[key].list.sort(
                (p1, p2) => (p1.price_new = p2.price_new)
              )[0];
              return Object.assign(gamesInfo[key], bestPrice, {
                plain: key
              }) as ItadDealFull;
            })
            .sort((a, b) =>
              a.title.replace(/[^\w\s]/g, "").toLowerCase() <
              b.title.replace(/[^\w\s]/g, "").toLowerCase()
                ? -1
                : 1
            )
        : [];
    }

    this.setState({ list, loading: false });
  }

  _getListItemComponent(deal: ItadDealFull) {
    return this._settings.listStyle == "list" ? (
      <DealItemListView
        deal={deal}
        style={this.state.style}
        navigation={this.props.navigation}
      />
    ) : (
      <DealItemCardView
        deal={deal}
        style={this.state.style}
        navigation={this.props.navigation}
      />
    );
  }
}
