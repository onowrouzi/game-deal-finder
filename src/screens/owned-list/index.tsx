import React, { Component } from "react";
import LoadingScreen from "../../components/loading-screen";
import { IsThereAnyDealApi, ItadDealFull } from "itad-api-client-ts";
import { API_KEY } from "react-native-dotenv";
import { Container } from "native-base";
import { FlatList, Alert } from "react-native";
import { Screens } from "../../types/screens";
import ThemesUtility from "../../utilities/themes";
import MenuButton from "../../components/menu-button";
import { Settings } from "../../types/settings";
import SettingsUtility from "../../utilities/settings";
import DealItemListView from "../../components/deal-item-list-view";
import DealItemCardView from "../../components/deal-item-card-view";
import EmptyListView from "../../components/empty-list-view";
import { uniq } from "lodash";
import DeleteButton from "../../components/delete-button";
import UserDataUtility from "../../utilities/user-data";

export default class OwnedListScreen extends Component<
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
  private _ownedList: string[];
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
    await this._getOwnedList();
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
          onRefresh={async () => await this._getOwnedList()}
          refreshing={this.state.refreshing}
          renderItem={({ item }) => this._getListItemComponent(item)}
          keyExtractor={(item, index) => item.plain}
          ListEmptyComponent={() => (
            <EmptyListView
              message="Your owned games list is empty!"
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
      "Would you like to empty your owned games list?",
      [
        { text: "NO", onPress: () => {} },
        {
          text: "YES",
          onPress: async () => {
            await UserDataUtility.setOwnedGames([]);
            await this._getOwnedList();
          }
        }
      ],
      {
        cancelable: false
      }
    );
  }

  async _getOwnedList() {
    this._ownedList = uniq(UserDataUtility.getOwnedGames());

    let list = [];

    if (this._ownedList && this._ownedList.length > 0) {
      for (let i = 0; i < this._ownedList.length; i += 100) {
        const end =
          i + 100 < this._ownedList.length
            ? i + 100
            : this._ownedList.length - i;
        const plains = this._ownedList.slice(i, end);

        if (plains.length > 0) {
          const gamesInfo = await this._api.getGameInfo(plains);
          const prices = await this._api.getGamePrices({
            plains,
            shops: this._settings.shops,
            region: this._settings.region,
            country: this._settings.country
          });
          list = list.concat(
            gamesInfo
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
              : []
          );
        }
      }
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
