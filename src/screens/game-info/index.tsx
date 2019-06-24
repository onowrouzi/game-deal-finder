import React, { Component } from "react";
import {
  ItadHistoricalGameInfo,
  IsThereAnyDealApi,
  ItadGameInfo,
  ItadDeal,
  ItadShop
} from "itad-api-client-ts";
import { Text, Card, CardItem, Content, Right, Left } from "native-base";
import { uniqBy, orderBy } from "lodash";
import { AsyncStorage, Image, TouchableOpacity } from "react-native";

import { API_KEY } from "react-native-dotenv";
import { Screens } from "..";
import { parsePriceString } from "../../services/price-parser";
import { Themes } from "../../services/themes";
import { LoadingScreen } from "../../components/loading-screen";
import WatchlistButton from "../../components/watchlist-button";
import { SettingTypes } from "../../types/setting-types.enum";

export default class GameInfoScreen extends Component<
  { navigation: any },
  {
    style: any;
    game?: ItadGameInfo;
    deals?: ItadDeal[];
    history?: ItadHistoricalGameInfo;
  }
> {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`,
    headerRight: <WatchlistButton plain={navigation.state.params.plain} />
  });

  private _api: IsThereAnyDealApi;
  private _plain: string;
  private _shops: ItadShop[];

  constructor(props) {
    super(props);

    this.state = {
      style: Themes.getThemeStyles()
    };
    this._api = new IsThereAnyDealApi(API_KEY);
    this._plain = this.props.navigation.getParam("plain", "");
  }

  async componentDidMount() {
    const promises = [];
    let shops, region;
    promises.push(this._api.getShops());
    promises.push(this._api.getGameInfo([this._plain]));
    promises.push(
      this._api.getHistoricalLow({
        plains: [this._plain]
      })
    );
    promises.push(
      AsyncStorage.multiGet(
        [SettingTypes.SHOPS, SettingTypes.REGION],
        (err, res) => res
      ).then(res => {
        shops = JSON.parse(res[0][1]) || [];
        region = res[1][1];
      })
    );

    const resolved = await Promise.all(promises);

    this._shops = resolved[0];

    const game = resolved[1][this._plain] as ItadGameInfo;
    const prices = await this._api.getGamePrices({
      plains: [this._plain],
      shops,
      region
    });

    const pageColorBrightness = this._getColorBrightness(
      this.state.style.primary.backgroundColor
    );

    const deals = prices[this._plain].list
      .filter(d => d.price_cut > 0)
      .map(deal => {
        deal.shop = this._shops.find(shop => shop.id == deal.shop.id);
        deal.shop.color = this._getAdjustedShopColor(
          deal.shop.color,
          pageColorBrightness
        );
        return deal;
      });

    const history = resolved[2][this._plain] as ItadHistoricalGameInfo;
    history.shop =
      this._shops.find(shop => shop.id == history.shop.id) || history.shop;
    history.shop.color = this._getAdjustedShopColor(
      history.shop.color || this.state.style.primary.color,
      pageColorBrightness
    );

    this.setState({
      game,
      deals,
      history
    });
  }

  render() {
    if (!this.state.game) {
      return <LoadingScreen />;
    }

    return (
      <Content style={this.state.style.primary}>
        {(() => {
          if (this.state.game.image) {
            return (
              <Image
                source={{ uri: this.state.game.image }}
                style={{ width: "100%", aspectRatio: 2 }}
              />
            );
          }
        })()}
        <Card style={this.state.style.primary}>
          <CardItem header bordered style={this.state.style.secondary}>
            <Text style={this.state.style.secondary}>Deals</Text>
          </CardItem>
          {this._getDealsComponents()}
        </Card>
        <Card style={this.state.style.primary}>
          <CardItem header bordered style={this.state.style.secondary}>
            <Text style={this.state.style.secondary}>Historical Low</Text>
          </CardItem>
          {this._getHistoricalLowComponent()}
        </Card>
      </Content>
    );
  }

  _getAdjustedShopColor(color: string, pageColorBrightness: number) {
    const shopColorBrightness = this._getColorBrightness(color);

    if (
      shopColorBrightness > -1 &&
      pageColorBrightness > -1 &&
      Math.abs(shopColorBrightness - pageColorBrightness) < 75
    ) {
      const percentToAdjust = (shopColorBrightness - pageColorBrightness) / 2;
      color = this._adjustColorBrightness(color, percentToAdjust);
    }

    return color;
  }

  _getColorBrightness(color: string) {
    color = color.replace("#", "");
    const sections =
      color.length > 3
        ? color.match(/(\S{2})/g)
        : color.match(/(\S{1})/g).map(c => c + c);
    if (color) {
      const r = parseInt(sections[0], 16);
      const g = parseInt(sections[1], 16);
      const b = parseInt(sections[2], 16);

      return (r * 299 + g * 587 + b * 114) / 1000;
    }

    return -1;
  }

  _adjustColorBrightness(color: string, percent: number) {
    var num = parseInt(color.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      B = ((num >> 8) & 0x00ff) + amt,
      G = (num & 0x0000ff) + amt;

    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
        (G < 255 ? (G < 1 ? 0 : G) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  _getHistoricalLowComponent() {
    if (this.state.history) {
      return (
        <CardItem style={this.state.style.primary}>
          <Left>
            <Text
              style={[
                this.state.style.primary,
                {
                  color: this.state.history.shop.color,
                  fontWeight: "bold"
                }
              ]}
            >
              {this.state.history.shop.title || this.state.history.shop.name}
            </Text>
          </Left>
          <Right style={this.state.style.primary}>
            <Text note numberOfLines={1} style={[{ fontSize: 10 }]}>
              {`${parsePriceString(this.state.history.price.toFixed(2))}    -${
                this.state.history.cut
              }%    (${new Date(
                this.state.history.added * 1000
              ).toLocaleDateString()})`}
            </Text>
          </Right>
        </CardItem>
      );
    }
  }

  _getDealsComponents() {
    if (this.state.deals && this.state.deals.length > 0) {
      const deals = orderBy(
        uniqBy(this.state.deals, d => d.shop.id),
        "price_new"
      );
      return deals.map(deal => (
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate(Screens.Webview, {
              uri: deal.url,
              title: deal.shop.title || deal.shop.name
            })
          }
          key={deal.shop.id}
          style={{
            borderWidth: 0.5,
            borderColor: this.state.style.secondary.backgroundColor
          }}
        >
          <CardItem style={this.state.style.primary}>
            <Left>
              <Text
                style={[
                  this.state.style.primary,
                  {
                    color: deal.shop.color,
                    fontWeight: "bold"
                  }
                ]}
              >
                {deal.shop.title || deal.shop.name}
              </Text>
            </Left>
            <Right style={this.state.style.primary}>
              <Text style={this.state.style.primary} numberOfLines={1}>
                <Text note numberOfLines={1} style={{ fontSize: 10 }}>
                  {`${parsePriceString(deal.price_new.toFixed(2))}    `}
                </Text>
                <Text
                  note
                  style={{
                    textDecorationLine: "line-through",
                    fontSize: 10
                  }}
                >
                  {parsePriceString(deal.price_old.toFixed(2))}
                </Text>
                <Text note numberOfLines={1} style={{ fontSize: 10 }}>
                  {`    -${deal.price_cut}%`}
                </Text>
              </Text>
            </Right>
          </CardItem>
        </TouchableOpacity>
      ));
    } else {
      return (
        <CardItem style={this.state.style.primary}>
          <Left>
            <Text style={this.state.style.primary}>NO CURRENT DEALS</Text>
          </Left>
        </CardItem>
      );
    }
  }
}
