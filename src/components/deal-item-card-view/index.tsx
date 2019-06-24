import React, { PureComponent } from "react";
import { Left, Right, Text, Card, CardItem } from "native-base";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "../../screens";

import { parsePriceString } from "../../services/price-parser";
import { ItadDealFull } from "itad-api-client-ts";
import { Image } from "react-native";

const NO_IMG = require("./../../../assets/no_img.png");

export default class DealItemCardView extends PureComponent<
  {
    deal: ItadDealFull;
    navigation: any;
    style: any;
  },
  {}
> {
  render() {
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
              {parsePriceString(this.props.deal.price_new.toFixed(2))} @{" "}
              {this.props.deal.shop.name || this.props.deal.shop.title}
            </Text>
          </Left>
          <Right>{this._getDiscountText()}</Right>
        </CardItem>
      </Card>
    );
  }

  _getDiscountText() {
    return this.props.deal.price_cut > 0 ? (
      <Text note>
        <Text note style={{ textDecorationLine: "line-through", fontSize: 10 }}>
          {parsePriceString(this.props.deal.price_old.toFixed(2))}
        </Text>
        <Text note numberOfLines={1} style={{ fontSize: 10 }}>
          {`  -${this.props.deal.price_cut}%`}
        </Text>
      </Text>
    ) : (
      <Text note style={{ fontSize: 10 }}>
        NO DEAL
      </Text>
    );
  }
}
