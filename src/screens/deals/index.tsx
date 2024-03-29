import React, { Component } from "react";
import { FlatList, View, BackHandler, Alert } from "react-native";
import { uniqBy, isEqual } from "lodash";
import {
  Spinner,
  Icon,
  Fab,
  Container,
  Header,
  Item,
  Input
} from "native-base";
import * as Font from "expo-font";

import { API_KEY } from "react-native-dotenv";
import { IsThereAnyDealApi, ItadDealFull } from "itad-api-client-ts";
import { Ionicons } from "@expo/vector-icons";
import MenuButton from "../../components/menu-button";
import RefreshButton from "../../components/refresh-button";
import SettingsButton from "../../components/settings-button";
import { Settings } from "../../types/settings";
import ThemesUtility from "../../utilities/themes";
import SettingsUtility from "../../utilities/settings";
import DealItemListView from "../../components/deal-item-list-view";
import DealItemCardView from "../../components/deal-item-card-view";
import EmptyListView from "../../components/empty-list-view";
import { AppLoading } from "expo";
import UserDataUtility from "../../utilities/user-data";

export default class DealsScreen extends Component<
  { navigation: any },
  {
    style: any;
    list: ItadDealFull[];
    showSpinner: boolean;
    isReady: boolean;
    refreshing: boolean;
    showSearchBar: boolean;
  }
> {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: <MenuButton navigation={navigation} />,
    headerRight: (
      <View style={{ flexDirection: "row" }}>
        <RefreshButton
          refresh={() => {
            navigation.state.params.refresh();
          }}
        />
        <SettingsButton navigation={navigation} />
      </View>
    )
  });

  private readonly LIMIT = 50;

  private _api: IsThereAnyDealApi;
  private _settings: Settings;
  private _length: number;
  private _offset: number;
  private _query: string;
  private _searchBarRef: Input;
  private _willFocusSub: any;
  private _willBlurSub: any;
  private _didFocusSub: any;

  constructor(props) {
    super(props);
    this.state = {
      style: {},
      list: [],
      showSpinner: false,
      isReady: false,
      refreshing: false,
      showSearchBar: false
    };
    this._api = new IsThereAnyDealApi(API_KEY);
    this._length = -1;
    this._offset = 0;

    this._init = this._init.bind(this);
    this._getDeals = this._getDeals.bind(this);
    this._refresh = this._refresh.bind(this);
    this._didFocus = this._didFocus.bind(this);
    this._willBlur = this._willBlur.bind(this);
    this._willFocus = this._willFocus.bind(this);
    this._willFocusSub = this.props.navigation.addListener(
      "willFocus",
      this._willFocus
    );
    this._didFocusSub = this.props.navigation.addListener(
      "didFocus",
      this._didFocus
    );
    this._willBlurSub = this.props.navigation.addListener(
      "willBlur",
      this._willBlur
    );
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._init}
          onFinish={() => {
            this.setState({
              isReady: true,
              style: ThemesUtility.getThemeStyles()
            });
          }}
        />
      );
    }

    return (
      <Container style={this.state.style.primary}>
        {this._getSearchBar()}
        <FlatList
          data={this.state.list}
          onRefresh={async () => await this._refresh()}
          refreshing={this.state.refreshing}
          renderItem={({ item }) => this._getDealComponent(item)}
          initialNumToRender={this.LIMIT}
          keyExtractor={(item, index) => `${item.plain}_${item.shop.id}`}
          onEndReachedThreshold={
            (this.state.list.length - 5) / (this.state.list.length * 1.0)
          }
          onEndReached={async () => this._getDeals()}
          ListEmptyComponent={() =>
            this.state.isReady && !this.state.refreshing ? (
              <EmptyListView
                message="No Deals Found..."
                linkMessage="Refresh Results?"
                linkAction={this._refresh}
                style={this.state.style}
              />
            ) : (
              <View />
            )
          }
        />
        {this._getSpinner()}
        {this._getSearchFab()}
      </Container>
    );
  }

  async _init() {
    try {
      const promises = [];
      promises.push(ThemesUtility.init());
      promises.push(SettingsUtility.init());
      promises.push(UserDataUtility.init());
      promises.push(
        Font.loadAsync({
          Roboto: require("./../../../node_modules/native-base/Fonts/Roboto.ttf"),
          Roboto_medium: require("./../../../node_modules/native-base/Fonts/Roboto_medium.ttf"),
          ...Ionicons.font
        })
      );

      await Promise.all(promises);

      this._settings = SettingsUtility.getSettings();
      await this._getDeals();
    } catch (err) {
      console.error(err);
    }
  }

  async componentDidMount() {
    if (this.state.isReady) {
      this._settings = SettingsUtility.getSettings();
      await this._getDeals();
    }

    this.props.navigation.setParams({ refresh: this._refresh });
  }

  componentWillUnmount() {
    this._willFocusSub && this._willFocusSub.remove();
    this._willBlurSub && this._willBlurSub.remove();
    this._didFocusSub && this._didFocusSub.remove();
  }

  async _willFocus() {
    const style = ThemesUtility.getThemeStyles();
    if (!isEqual(style, this.state.style)) {
      this.setState({ style });
    }
    this._settings = SettingsUtility.getSettings();
    if (SettingsUtility.shouldRefresh()) {
      await this._refresh();
    }
  }

  _didFocus() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this._onAndroidBackButtonPressed
    );
  }

  _willBlur() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this._onAndroidBackButtonPressed
    );
  }

  _onAndroidBackButtonPressed() {
    Alert.alert(
      "Exit Game Deal Finder?",
      "Would you like to exit Game Deal Finder?",
      [
        { text: "Exit", onPress: () => BackHandler.exitApp() },
        { text: "Cancel", onPress: () => {} }
      ],
      {
        cancelable: false
      }
    );
    return true;
  }

  _getSearchBar() {
    if (this.state.showSearchBar) {
      return (
        <Header searchBar style={{ backgroundColor: "#212121" }}>
          <Item>
            <Icon name="search" />
            <Input
              ref={searchBarRef => {
                this._searchBarRef = searchBarRef;
              }}
              defaultValue={this._query}
              placeholder="Search by title..."
              onEndEditing={async evt => {
                if (
                  evt.nativeEvent.text ||
                  (!evt.nativeEvent.text && this._query)
                ) {
                  await this._refresh(evt.nativeEvent.text);
                }
              }}
            />
          </Item>
        </Header>
      );
    }
  }

  async _getDeals() {
    if (this._length > -1 && this._length == this.state.list.length) {
      return;
    }

    if (!this.state.refreshing) {
      this.setState({ showSpinner: true });
    }

    const deals = await this._api.getDealsFull(
      {
        shops: this._settings.shops,
        region: this._settings.region,
        limit: this.LIMIT,
        offset: this._offset
      },
      this._query
    );

    this._offset += this.LIMIT;
    this._length = deals.list.length > 0 ? deals.count : this.state.list.length;

    const list = uniqBy(
      this.state.list.concat(deals.list),
      d => d.plain + d.shop.id
    ).filter(
      d =>
        (d.price_cut > 0 || this._query) &&
        (this._settings.includeDlc || !d.is_dlc) &&
        (this._settings.includeBundles || !d.is_package)
    );

    this.setState({
      list,
      showSpinner: false,
      refreshing: false
    });
  }

  async _refresh(query?: string) {
    this._query = query;
    this._length = -1;
    this._offset = 0;
    this.setState({
      list: [],
      refreshing: true,
      showSearchBar: false,
      showSpinner: false
    });
    await this._getDeals();
  }

  _getSpinner() {
    if (this.state.showSpinner && this.state.list.length > 0) {
      return <Spinner />;
    }
  }

  _getDealComponent(d) {
    return this._settings.listStyle == "list" ? (
      <DealItemListView
        deal={d}
        navigation={this.props.navigation}
        style={this.state.style}
      />
    ) : (
      <DealItemCardView
        deal={d}
        navigation={this.props.navigation}
        style={this.state.style}
      />
    );
  }

  _getSearchFab() {
    if (this.state.isReady) {
      return (
        <Fab
          direction="up"
          style={{ backgroundColor: "#212121" }}
          position="bottomRight"
          onPress={() => {
            this.setState({ showSearchBar: !this.state.showSearchBar }, () => {
              if (this._searchBarRef) {
                // @ts-ignore
                this._searchBarRef._root.focus();
              }
            });
          }}
        >
          <Icon name="search" />
        </Fab>
      );
    }
  }
}
