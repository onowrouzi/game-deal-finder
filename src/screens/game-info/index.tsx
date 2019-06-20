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
  Button,
  Content
} from "native-base";
import { uniqBy, orderBy } from "lodash";
import { AsyncStorage, Image } from "react-native";

import { API_KEY } from "react-native-dotenv";
import { Screens } from "..";

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

  constructor(props) {
    super(props);

    this.state = {};
    this._api = new IsThereAnyDealApi(API_KEY);
    this._plain = this.props.navigation.getParam("plain", "");
  }

  async componentDidMount() {
    const shops = JSON.parse(
      await AsyncStorage.getItem("shops", (err, res) => res)
    );
    const region = await AsyncStorage.getItem("region", (err, res) => res);
    const game = await this._api.getGameInfo([this._plain]);
    const prices = await this._api.getGamePrices({
      plains: [this._plain],
      shops,
      region
    });
    const history = await this._api.getHistoricalLow({
      plains: [this._plain]
    });
    this._shops = await this._api.getShops();

    const deals = prices[this._plain].list
      .filter(d => d.price_cut > 0)
      .map(deal => {
        deal.shop = this._shops.find(shop => shop.id == deal.shop.id);
        return deal;
      });

    this.setState({
      game: game[this._plain],
      deals,
      history: history[this._plain]
    });
  }

  render() {
    if (!this.state.game) {
      return <Spinner />;
    }

    return (
      <Content>
        {(() => {
          if (this.state.game.image) {
            return (
              <Card style={{ flex: 0 }}>
                <CardItem>
                  <Body>
                    <Image
                      source={{ uri: this.state.game.image }}
                      style={{ width: "100%", aspectRatio: 2 }}
                    />
                  </Body>
                </CardItem>
              </Card>
            );
          }
        })()}
        <Card>
          <CardItem header bordered>
            <Text>Deals</Text>
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
        <CardItem bordered key={deal.shop.id}>
          <Body>
            <Button
              transparent
              onPress={() =>
                this.props.navigation.navigate(Screens.Webview, {
                  uri: deal.url,
                  title: deal.shop.title || deal.shop.name
                })
              }
            >
              <Text style={{ color: deal.shop.color, fontWeight: "bold" }}>
                {deal.shop.title || deal.shop.name}
              </Text>
            </Button>
            <Text
              style={{ marginLeft: 16 }}
              note
              numberOfLines={1}
            >{`$${deal.price_new.toFixed(2)}`}</Text>
            <Text
              note
              style={{
                textDecorationLine: "line-through",
                marginLeft: 16
              }}
            >
              {`$${deal.price_old.toFixed(2)}`}
            </Text>
            <Text note numberOfLines={1} style={{ marginLeft: 16 }}>
              {`-${Math.floor(100 - (deal.price_new / deal.price_old) * 100)}%`}
            </Text>
          </Body>
        </CardItem>
      ));
    }
  }
}
