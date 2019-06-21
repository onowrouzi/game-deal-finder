import React, { Component, PureComponent } from "react";
import {
  FlatList,
  View,
  AsyncStorage,
  Image,
  TouchableOpacity
} from "react-native";
import { uniqBy, isEqual } from "lodash";
import {
  ListItem,
  Left,
  Body,
  Text,
  Right,
  Button,
  Spinner,
  Icon,
  Fab,
  Container,
  Header,
  Item,
  Input,
  Card,
  CardItem,
  Thumbnail
} from "native-base";
import * as Font from "expo-font";

import { API_KEY } from "react-native-dotenv";
import { IsThereAnyDealApi, ItadDealFull } from "itad-api-client-ts";
import { Ionicons } from "@expo/vector-icons";
import MenuButton from "../../components/menu-button";
import RefreshButton from "../../components/refresh-button";
import SettingsButton from "../../components/settings-button";
import { DealListStyle } from "../../types/deal-list-style";
import { Settings } from "../../types/settings";
import { SettingTypes } from "../../types/setting-types.enum";
import { Screens } from "..";
import { parsePriceString } from "../../services/price-parser";
import { Themes } from "../../services/themes";
import { LoadingScreen } from "../../components/loading-screen";
import SettingsUtility from "../../services/settings";
import { NavigationEvents } from "react-navigation";

const NO_IMG = require("./../../../assets/no_img.png");

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
  private _currency: { sign: string; code: string; left: boolean };
  private _length: number;
  private _offset: number;
  private _query: string;
  private _searchBarRef: Input;

  constructor(props) {
    super(props);
    this.state = {
      style: {},
      list: [],
      showSpinner: false,
      isReady: false,
      refreshing: true,
      showSearchBar: false
    };
    this._api = new IsThereAnyDealApi(API_KEY);
    this._length = -1;
    this._offset = 0;

    this._refresh = this._refresh.bind(this);
  }

  render() {
    return this.state.isReady && this.state.list.length > 0 ? (
      <Container style={this.state.style.primary}>
        <NavigationEvents
          onWillFocus={async () => {
            this._setStyles();
            if (SettingsUtility.shouldRefresh()) {
              await this._refresh();
            }
          }}
        />
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
        />
        {this._getSpinner()}
        {this._getSearchFab()}
      </Container>
    ) : this.state.isReady &&
      !this.state.refreshing &&
      this.state.list.length === 0 ? (
      <Container style={this.state.style.primary}>
        {this._getSearchBar()}
        <View
          style={{ flex: 1, justifyContent: "center", alignContent: "center" }}
        >
          <Text
            style={[
              this.state.style.primary,
              { textAlign: "center", fontSize: 20 }
            ]}
          >
            No Deals Found...
          </Text>
          <Button transparent full>
            <Text
              uppercase={false}
              style={[this.state.style.link, { fontSize: 20 }]}
              onPress={() => this._refresh()}
            >
              Refresh Results?
            </Text>
          </Button>
        </View>
        {this._getSearchFab()}
      </Container>
    ) : (
      <LoadingScreen />
    );
  }

  async componentDidMount() {
    const style = await Themes.getThemeStyles();
    this.setState({ style });

    this._settings = SettingsUtility.getSettings();

    const promises = [];
    promises.push(this._getDeals());
    promises.push(
      Font.loadAsync({
        Roboto: require("./../../../node_modules/native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("./../../../node_modules/native-base/Fonts/Roboto_medium.ttf"),
        ...Ionicons.font
      })
    );

    await Promise.all(promises);

    this.setState({ isReady: true });

    this.props.navigation.setParams({ refresh: this._refresh });
  }

  _setStyles() {
    const style = Themes.getThemeStyles();
    if (!isEqual(this.state.style, style)) {
      this.setState({ style });
    }
  }

  _getSearchBar() {
    return this.state.showSearchBar ? (
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
    ) : (
      <View />
    );
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
        d.price_cut > 0 &&
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
    this.setState({ list: [], refreshing: true, showSearchBar: false });
    await this._getDeals();
  }

  _getSpinner() {
    return this.state.showSpinner ? <Spinner /> : <View />;
  }

  _getDealComponent(d) {
    return d ? (
      <DealItemComponent
        deal={d}
        listStyle={this._settings.listStyle}
        navigation={this.props.navigation}
        style={this.state.style}
        currencySign={
          this._currency ? this._currency.sign || this._currency.code : "$"
        }
        currencyOnLeft={!this._currency || this._currency.left}
      />
    ) : (
      <View />
    );
  }

  _getSearchFab() {
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

export class DealItemComponent extends PureComponent<
  {
    deal: ItadDealFull;
    currencySign: string;
    currencyOnLeft: boolean;
    listStyle?: DealListStyle;
    navigation: any;
    style: any;
  },
  {}
> {
  render() {
    return this.props.listStyle == "card"
      ? this._getCardView()
      : this._getListView();
  }

  _getListView() {
    return (
      <ListItem
        thumbnail
        style={this.props.style.primary}
        key={`${this.props.deal.plain}_${this.props.deal.shop.id}`}
      >
        <Left>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate(Screens.GameInfo, {
                plain: this.props.deal.plain,
                title: this.props.deal.title
              })
            }
          >
            <Thumbnail
              square
              resizeMode="contain"
              large
              source={
                this.props.deal.image
                  ? {
                      uri: this.props.deal.image
                    }
                  : NO_IMG
              }
            />
          </TouchableOpacity>
        </Left>
        <Body>
          <Text
            numberOfLines={1}
            style={[{ fontSize: 12 }, this.props.style.primary]}
          >
            {this.props.deal.title}
          </Text>
          <Text note numberOfLines={1} style={{ fontSize: 10 }}>
            {`${parsePriceString(
              this.props.deal.price_new.toFixed(2),
              this.props.currencySign,
              this.props.currencyOnLeft
            )} @ ${this.props.deal.shop.title || this.props.deal.shop.name}`}
          </Text>
          <Text>
            <Text
              note
              style={{ textDecorationLine: "line-through", fontSize: 10 }}
            >
              {parsePriceString(
                this.props.deal.price_old.toFixed(2),
                this.props.currencySign,
                this.props.currencyOnLeft
              )}
            </Text>
            <Text note numberOfLines={1} style={{ fontSize: 10 }}>
              {`  -${this.props.deal.price_cut}%`}
            </Text>
          </Text>
        </Body>
        <Right>
          <Button
            transparent
            onPress={() =>
              this.props.navigation.navigate(Screens.GameInfo, {
                plain: this.props.deal.plain,
                title: this.props.deal.title
              })
            }
          >
            <Text style={this.props.style.link}>View</Text>
          </Button>
        </Right>
      </ListItem>
    );
  }

  _getCardView() {
    return (
      <Card style={this.props.style.primary}>
        <CardItem header bordered style={this.props.style.primary}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate(Screens.GameInfo, {
                plain: this.props.deal.plain,
                title: this.props.deal.title
              })
            }
          >
            <Text
              uppercase={false}
              style={[this.props.style.primary, this.props.style.link]}
            >
              {this.props.deal.title}
            </Text>
          </TouchableOpacity>
        </CardItem>
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate(Screens.GameInfo, {
              plain: this.props.deal.plain,
              title: this.props.deal.title
            })
          }
        >
          <CardItem style={this.props.style.primary}>
            <Image
              resizeMode="contain"
              source={
                this.props.deal.image
                  ? {
                      uri: this.props.deal.image
                    }
                  : NO_IMG
              }
              style={{
                width: "100%",
                aspectRatio: 2
              }}
            />
          </CardItem>
        </TouchableOpacity>
        <CardItem footer bordered style={this.props.style.note}>
          <Left>
            <Text note style={this.props.style.note}>
              {parsePriceString(
                this.props.deal.price_new.toFixed(2),
                this.props.currencySign,
                this.props.currencyOnLeft
              )}{" "}
              @ {this.props.deal.shop.name || this.props.deal.shop.title}
            </Text>
          </Left>
          <Right>
            <Text style={this.props.style.note}>
              <Text note style={this.props.style.note}>
                -{this.props.deal.price_cut}%{" "}
              </Text>
              <Text
                note
                style={[
                  this.props.style.note,
                  { textDecorationLine: "line-through" }
                ]}
              >
                {parsePriceString(
                  this.props.deal.price_old.toFixed(2),
                  this.props.currencySign,
                  this.props.currencyOnLeft
                )}
              </Text>
            </Text>
          </Right>
        </CardItem>
      </Card>
    );
  }
}
