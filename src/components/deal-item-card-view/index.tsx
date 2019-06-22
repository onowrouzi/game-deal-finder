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
    currencySign: string;
    currencyOnLeft: boolean;
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
