import React, { Component } from "react";
import {
  ItadHistoricalGameInfo,
  IsThereAnyDealApi,
  ItadGameInfo,
  ItadDeal,
  ItadShop
} from "itad-api-client-ts";
import {
  Text,
  Spinner,
  Card,
  CardItem,
  Body,
  Content,
  Right,
  Container,
  Left
} from "native-base";
import { uniqBy, orderBy } from "lodash";
import { AsyncStorage, Image, TouchableOpacity } from "react-native";

import { API_KEY } from "react-native-dotenv";
import { Screens } from "..";
import { parsePriceString } from "../../services/price-parser";
import { Currency } from "../../types/currency";
import { Themes } from "../../services/themes";
import { LoadingScreen } from "../../components/loading-screen";

export default class GameInfoScreen extends Component<
  { navigation: any },
  {
    game?: ItadGameInfo;
    deals?: ItadDeal[];
    history?: ItadHistoricalGameInfo;
  }
> {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`
  });

  private _api: IsThereAnyDealApi;
  private _plain: string;
  private _shops: ItadShop[];
  private _currency: Currency;
  private _style: any;

  constructor(props) {
    super(props);

    this.state = {};
    this._api = new IsThereAnyDealApi(API_KEY);
    this._plain = this.props.navigation.getParam("plain", "");
    this._style = {};
  }

  async componentDidMount() {
    this._style = Themes.getThemeStyles();

    const promises = [];
    promises.push(
      AsyncStorage.getItem("currency", (err, res) => res).then(
        res => JSON.parse(res) || {}
      )
    );
    promises.push(
      AsyncStorage.getItem("shops", (err, res) => res).then(
        res => JSON.parse(res) || []
      )
    );
    promises.push(AsyncStorage.getItem("region", (err, res) => res));
    promises.push(this._api.getGameInfo([this._plain]));
    promises.push(
      this._api.getHistoricalLow({
        plains: [this._plain]
      })
    );
    promises.push(this._api.getShops());

    const resolved = await Promise.all(promises);

    this._currency = resolved[0];
    this._shops = resolved[5];

    const prices = await this._api.getGamePrices({
      plains: [this._plain],
      shops: resolved[1],
      region: resolved[2]
    });

    const deals = prices[this._plain].list
      .filter(d => d.price_cut > 0)
      .map(deal => {
        deal.shop = this._shops.find(shop => shop.id == deal.shop.id);
        return deal;
      });

    this.setState({
      game: resolved[3][this._plain],
      deals,
      history: resolved[4][this._plain]
    });
  }

  render() {
    if (!this.state.game) {
      return <LoadingScreen />;
    }

    return (
      <Content style={this._style.primary}>
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
        <Card style={this._style.primary}>
          <CardItem header bordered style={this._style.secondary}>
            <Text style={this._style.secondary}>Deals</Text>
          </CardItem>
          {this._getDealsComponents()}
        </Card>
      </Content>
    );
  }

  _getDealsComponents() {
    if (this.state.deals) {
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
            borderColor: this._style.secondary.backgroundColor
          }}
        >
          <CardItem style={this._style.primary}>
            <Left>
              <Text
                style={[
                  this._style.primary,
                  { color: deal.shop.color, fontWeight: "bold" }
                ]}
              >
                {deal.shop.title || deal.shop.name}
              </Text>
            </Left>
            <Right style={this._style.primary}>
              <Text style={this._style.primary} numberOfLines={1}>
                <Text note numberOfLines={1} style={{ fontSize: 10 }}>
                  {`${parsePriceString(
                    deal.price_new.toFixed(2),
                    this._currency.sign,
                    this._currency.left
                  )}    `}
                </Text>
                <Text
                  note
                  style={{
                    textDecorationLine: "line-through",
                    fontSize: 10
                  }}
                >
                  {parsePriceString(
                    deal.price_old.toFixed(2),
                    this._currency.sign,
                    this._currency.left
                  )}
                </Text>
                <Text note numberOfLines={1} style={{ fontSize: 10 }}>
                  {`    -${deal.price_cut}%`}
                </Text>
              </Text>
            </Right>
          </CardItem>
        </TouchableOpacity>
      ));
    }
  }
}
