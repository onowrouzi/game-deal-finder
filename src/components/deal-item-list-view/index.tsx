import React, { PureComponent } from "react";
import {
  Left,
  Thumbnail,
  Body,
  Right,
  Button,
  ListItem,
  Text
} from "native-base";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "../../screens";

import { parsePriceString } from "../../services/price-parser";
import { ItadDealFull } from "itad-api-client-ts";

const NO_IMG = require("./../../../assets/no_img.png");

export default class DealItemListView extends PureComponent<
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
}
