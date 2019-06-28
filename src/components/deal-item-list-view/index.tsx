import React, { PureComponent } from "react";
import {
  Left,
  Thumbnail,
  Body,
  Right,
  Button,
  ListItem,
  Text,
  View,
  Icon
} from "native-base";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "../../types/screens";

import { parsePriceString } from "../../utilities/price-parser";
import { ItadDealFull } from "itad-api-client-ts";
import { Vibration } from "react-native";
import GameOptionsRow from "../game-options-row";
import UserDataUtility from "../../utilities/user-data";
const NO_IMG = require("./../../../assets/no_img.png");

export default class DealItemListView extends PureComponent<
  {
    deal: ItadDealFull;
    navigation: any;
    style: any;
  },
  { optionsVisible: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      optionsVisible: false
    };

    this._toggleGameOptionsVisibility = this._toggleGameOptionsVisibility.bind(
      this
    );
  }

  render() {
    return (
      <View>
        <TouchableOpacity
          delayLongPress={300}
          onLongPress={this._toggleGameOptionsVisibility}
          onPress={() =>
            this.props.navigation.navigate(Screens.GameInfo, {
              plain: this.props.deal.plain,
              title: this.props.deal.title
            })
          }
        >
          <ListItem
            thumbnail
            style={this.props.style.primary}
            key={`${this.props.deal.plain}_${
              this.props.deal.shop
                ? this.props.deal.shop.id
                : Math.random() * 100
            }`}
          >
            <Left>
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
            </Left>
            <Body>
              <Text
                numberOfLines={1}
                style={[{ fontSize: 12 }, this.props.style.primary]}
              >
                {this.props.deal.title}
              </Text>
              {this._getCurrentPriceText()}
              <View style={{ flexDirection: "row" }}>
                {this._getDiscountText()}
                {this._getOwnedIcon()}
                {this._getWatchingIcon()}
              </View>
            </Body>
            <Right>
              <Button transparent>
                <Text style={this.props.style.link}>View</Text>
              </Button>
            </Right>
          </ListItem>
        </TouchableOpacity>
        {this._getGameOptionsRow()}
      </View>
    );
  }

  _getCurrentPriceText() {
    return this.props.deal.price_new ? (
      <Text note numberOfLines={1} style={{ fontSize: 10 }}>
        {`${parsePriceString(this.props.deal.price_new.toFixed(2))} @ ${this
          .props.deal.shop.title || this.props.deal.shop.name}`}
      </Text>
    ) : (
      <Text note numberOfLines={1} style={{ fontSize: 10 }}>
        NO PRICE INFO AVAILABLE
      </Text>
    );
  }

  _getDiscountText() {
    return this.props.deal.price_old && this.props.deal.price_cut > 0 ? (
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

  _toggleGameOptionsVisibility() {
    Vibration.vibrate(100);
    this.setState({ optionsVisible: !this.state.optionsVisible });
  }

  _getGameOptionsRow() {
    if (this.state.optionsVisible) {
      return (
        <GameOptionsRow
          plain={this.props.deal.plain}
          style={this.props.style}
          includeBorder={true}
        />
      );
    }
  }

  _getOwnedIcon() {
    if (this._isGameOwned()) {
      return (
        <Icon
          name="checkcircle"
          type="AntDesign"
          style={[
            this.props.style.primary,
            { fontSize: 10, marginLeft: 5, marginTop: 2 }
          ]}
        />
      );
    }
  }

  _getWatchingIcon() {
    if (this._isGameWatched()) {
      return (
        <Icon
          name="eye"
          type="Entypo"
          style={[
            this.props.style.primary,
            { fontSize: 10, marginLeft: 5, marginTop: 2 }
          ]}
        />
      );
    }
  }

  _isGameOwned() {
    return UserDataUtility.getOwnedGames().includes(this.props.deal.plain);
  }

  _isGameWatched() {
    return UserDataUtility.getWatchlist().includes(this.props.deal.plain);
  }
}
