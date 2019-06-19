import React, { Component, PureComponent } from "react";
import { FlatList, Dimensions, View, AsyncStorage } from "react-native";
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
  Input
} from "native-base";
import * as Font from "expo-font";

import { API_KEY } from "react-native-dotenv";
import {
  IsThereAnyDealApi,
  ItadDealFull,
  ItadGameDealSearchParams
} from "itad-api-client-ts";
import { Ionicons } from "@expo/vector-icons";
import GameThumbnailComponent from "../../components/game-thumbnail";

export default class DealsScreen extends Component<
  { navigation: any },
  {
    list: ItadDealFull[];
    showFab: boolean;
    showSpinner: boolean;
    isReady: boolean;
    refreshing: boolean;
    showSearchBar: boolean;
  }
> {
  private readonly LIMIT = 50;
  private _api: IsThereAnyDealApi;
  private _params: ItadGameDealSearchParams & {
    includeDlc: boolean;
    includeBundles: boolean;
  };
  private _height: any;
  private _length: number;
  private _offset: number;
  private _query: string;

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      showFab: false,
      showSpinner: false,
      isReady: false,
      refreshing: true,
      showSearchBar: false
    };
    this._api = new IsThereAnyDealApi(API_KEY);
    this._length = -1;
    this._offset = 0;
    this._height = Dimensions.get("screen").height;

    this._refresh.bind(this);
  }

  render() {
    return this.state.isReady && this.state.list.length > 0 ? (
      <Container>
        {(() =>
          this.state.showSearchBar ? (
            <Header
              searchBar
              ref="searchBar"
              style={{ backgroundColor: "#212121" }}
            >
              <Item>
                <Icon name="search" />
                <Input
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
          ))()}
        <FlatList
          ref="listRef"
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
          onScroll={evt => this._setShowToTopFab(evt)}
        />
        {this._setSpinner()}
        {this._getScrollToTopFab()}
        {this._getOptionsFab()}
      </Container>
    ) : this.state.isReady &&
      !this.state.refreshing &&
      this.state.list.length === 0 ? (
      <Container
        style={{ flex: 1, justifyContent: "center", alignContent: "center" }}
      >
        <Text style={{ textAlign: "center", fontSize: 20 }}>
          No Deals Found...
        </Text>
        <Button transparent full>
          <Text
            uppercase={false}
            style={{ fontSize: 20 }}
            onPress={() => this._refresh()}
          >
            Refresh Results?
          </Text>
        </Button>
        {this._getOptionsFab()}
      </Container>
    ) : (
      <Spinner />
    );
  }

  async componentDidMount() {
    this._params = await this._getSearchParams();
    await this._getDeals();

    await Font.loadAsync({
      Roboto: require("./../../../node_modules/native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("./../../../node_modules/native-base/Fonts/Roboto_medium.ttf"),
      ...Ionicons.font
    });

    this.setState({ isReady: true });

    this.props.navigation.addListener("didFocus", async () => {
      const params = await this._getSearchParams();
      if (!isEqual(params, this._params)) {
        this._params = params;
        await this._refresh();
      }
    });
  }

  async _getSearchParams(): Promise<
    ItadGameDealSearchParams & { includeBundles: boolean; includeDlc: boolean }
  > {
    const region = await AsyncStorage.getItem("region", (err, res) => res);
    const shops =
      JSON.parse(await AsyncStorage.getItem("shops", (err, res) => res)) || [];
    const includeBundlesJson = JSON.parse(
      await AsyncStorage.getItem("include_bundles", (err, res) => res)
    );
    const includeBundles =
      includeBundlesJson != null ? includeBundlesJson : true;
    const includeDlcJson = JSON.parse(
      await AsyncStorage.getItem("include_dlc", (err, res) => res)
    );
    const includeDlc = includeDlcJson != null ? includeDlcJson : true;
    return {
      region,
      shops,
      includeBundles,
      includeDlc
    };
  }

  async _getDeals() {
    if (this._length > -1 && this._length == this.state.list.length) {
      return;
    }

    if (!this.state.refreshing) {
      this.setState({ showSpinner: true });
    }

    this._offset += this.LIMIT;

    const deals = await this._api.getDealsFull(
      {
        shops: this._params.shops,
        region: this._params.region,
        limit: this.LIMIT,
        offset: this._offset
      },
      this._query
    );

    this._length = deals.list.length > 0 ? deals.count : this.state.list.length;

    const list = uniqBy(this.state.list.concat(deals.list), "plain").filter(
      d =>
        d.price_cut > 0 &&
        (this._params.includeDlc || !d.is_dlc) &&
        (this._params.includeBundles || !d.is_package)
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

  _setSpinner() {
    return this.state.showSpinner ? <Spinner /> : <View />;
  }

  _getDealComponent(d) {
    return d ? (
      <DealItemComponent deal={d} navigation={this.props.navigation} />
    ) : (
      <View />
    );
  }

  _setShowToTopFab(evt) {
    if (evt.nativeEvent.contentOffset.y > this._height && !this.state.showFab) {
      this.setState({ showFab: true });
    } else if (
      evt.nativeEvent.contentOffset.y <= this._height &&
      this.state.showFab
    ) {
      this.setState({ showFab: false });
    }
  }

  _getScrollToTopFab() {
    return this.state.showFab ? (
      <Fab
        direction="up"
        style={{
          backgroundColor: "#212121",
          position: "absolute",
          right: 0,
          bottom: 0
        }}
        position="bottomLeft"
        onPress={() =>
          // @ts-ignore
          this.refs.listRef.scrollToOffset({ offset: 0, animated: true })
        }
      >
        <Icon name="arrow-up" />
      </Fab>
    ) : (
      <View />
    );
  }

  _getOptionsFab() {
    return (
      <Fab
        direction="up"
        style={{ backgroundColor: "#212121" }}
        position="bottomRight"
        onPress={() =>
          this.setState({ showSearchBar: !this.state.showSearchBar })
        }
      >
        <Icon name="search" />
      </Fab>
    );
  }
}

export class DealItemComponent extends PureComponent<
  { deal: ItadDealFull; navigation: any },
  {}
> {
  render() {
    return (
      <ListItem
        thumbnail
        key={`${this.props.deal.plain}_${this.props.deal.shop.id}`}
      >
        <Left>
          <GameThumbnailComponent src={this.props.deal.image} />
        </Left>
        <Body>
          <Text numberOfLines={1}>{this.props.deal.title}</Text>
          <Text note numberOfLines={1}>
            {`$${this.props.deal.price_new.toFixed(2)} @ ${this.props.deal.shop
              .title || this.props.deal.shop.name}`}
          </Text>
          <Text note style={{ textDecorationLine: "line-through" }}>
            {`$${this.props.deal.price_old.toFixed(2)}`}
          </Text>
          <Text note numberOfLines={1}>
            {`-${Math.floor(
              100 -
                (this.props.deal.price_new / this.props.deal.price_old) * 100
            )}%`}
          </Text>
        </Body>
        <Right>
          <Button
            transparent
            onPress={() =>
              this.props.navigation.navigate("GameInfo", {
                plain: this.props.deal.plain,
                title: this.props.deal.title
              })
            }
          >
            <Text>View</Text>
          </Button>
        </Right>
      </ListItem>
    );
  }
}
