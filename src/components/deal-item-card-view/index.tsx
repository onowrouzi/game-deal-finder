import React, { PureComponent } from "react";
import { Left, Right, Text, Card, CardItem, Icon, Body } from "native-base";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "../../types/screens";

import { parsePriceString } from "../../utilities/price-parser";
import { ItadDealFull } from "itad-api-client-ts";
import { Image, Vibration, Dimensions } from "react-native";
import GameOptionsRow from "../game-options-row";
import UserDataUtility from "../../utilities/user-data";

const NO_IMG = require("./../../../assets/no_img.png");

export default class DealItemCardView extends PureComponent<
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
      <Card style={this.props.style.primary}>
        <TouchableOpacity
          onLongPress={this._toggleGameOptionsVisibility}
          onPress={() =>
            this.props.navigation.navigate(Screens.GameInfo, {
              plain: this.props.deal.plain,
              title: this.props.deal.title
            })
          }
          style={{ margin: 0 }}
        >
          <CardItem header bordered style={this.props.style.primary}>
            <Left>
              <Text
                numberOfLines={1}
                uppercase={false}
                style={[
                  this.props.style.primary,
                  this.props.style.link,
                  { width: Dimensions.get("window").width * 0.8 }
                ]}
              >
                {this.props.deal.title}
              </Text>
            </Left>
            <Right
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end"
              }}
            >
              {this._getOwnedIcon()}
              {this._getWatchingIcon()}
            </Right>
          </CardItem>
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
          <CardItem footer bordered style={this.props.style.note}>
            <Left>{this._getCurrentPriceText()}</Left>
            <Right>{this._getDiscountText()}</Right>
          </CardItem>
        </TouchableOpacity>
        {this._getGameOptionsRow()}
      </Card>
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
          includeBorder={false}
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
            {
              fontSize: 10,
              marginLeft: 5,
              marginTop: 2,
              alignSelf: "flex-end",
              textAlign: "right"
            }
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
            {
              fontSize: 10,
              marginLeft: 5,
              marginTop: 2,
              alignSelf: "flex-end",
              textAlign: "right"
            }
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
