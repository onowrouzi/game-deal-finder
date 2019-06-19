import React, { PureComponent } from "react";
import {
  View,
  Content,
  List,
  ListItem,
  Text,
  Body,
  Left,
  Picker,
  Spinner
} from "native-base";
import { ItadShop, ItadRegions, IsThereAnyDealApi } from "itad-api-client-ts";
import { API_KEY } from "react-native-dotenv";
import { Switch, CheckBox, AsyncStorage } from "react-native";

export default class SettingsScreen extends PureComponent<
  {},
  {
    shops: string[];
    region?: string;
    includeDlc: boolean;
    includeBundles: boolean;
    loading: boolean;
  }
> {
  private _api: IsThereAnyDealApi;
  private _shops: ItadShop[];
  private _regions: ItadRegions;

  constructor(props) {
    super(props);

    this.state = {
      includeBundles: false,
      includeDlc: false,
      shops: [],
      loading: true
    };

    this._api = new IsThereAnyDealApi(API_KEY);
  }

  async componentDidMount() {
    this._shops = await this._api.getShops();
    this._regions = await this._api.getRegions();

    const shops =
      JSON.parse(await AsyncStorage.getItem("shops", (err, res) => res)) || [];
    const region = await AsyncStorage.getItem("region", (err, res) => res);
    const includeBundles = JSON.parse(
      await AsyncStorage.getItem("include_bundles", (err, res) => res)
    );
    const includeDlc = JSON.parse(
      await AsyncStorage.getItem("include_dlc", (err, res) => res)
    );

    this.setState({
      includeBundles: includeBundles != null ? includeBundles : true,
      includeDlc: includeDlc != null ? includeDlc : true,
      shops: shops.length > 0 ? shops : this._shops.map(shop => shop.id),
      region,
      loading: false
    });
  }

  async _toggleIncludeBundles() {
    const includeBundles = !this.state.includeBundles;
    this.setState({ includeBundles });

    await AsyncStorage.setItem(
      "include_bundles",
      JSON.stringify(includeBundles)
    );
  }

  async _toggleIncludeDlc() {
    const includeDlc = !this.state.includeDlc;
    this.setState({ includeDlc });

    await AsyncStorage.setItem("include_dlc", JSON.stringify(includeDlc));
  }

  render() {
    return this.state.loading ? (
      <Spinner />
    ) : (
      <Content>
        <List>
          <ListItem itemDivider>
            <Text>General</Text>
          </ListItem>
          <ListItem key={"include_dlc"}>
            <Switch
              value={this.state.includeDlc}
              onValueChange={async => this._toggleIncludeDlc()}
            />
            <Body>
              <Text>Include DLC</Text>
            </Body>
          </ListItem>
          <ListItem key={"include_bundles"}>
            <Switch
              value={this.state.includeBundles}
              onValueChange={async => this._toggleIncludeBundles()}
            />
            <Body>
              <Text>Include Bundles</Text>
            </Body>
          </ListItem>
          <ListItem key="region">
            <Left>
              <Text>Region</Text>
            </Left>
            <Body>{this._getRegionsPicker()}</Body>
          </ListItem>
          <ListItem itemDivider>
            <Text>Stores</Text>
          </ListItem>
          {this._getShopsComponent()}
        </List>
      </Content>
    );
  }

  _getShopsComponent() {
    return this._shops ? (
      [
        <ListItem key="all">
          <CheckBox
            value={this._isShopSelected("all")}
            onValueChange={() => this._toggleAllShopsSelected()}
          />
          <Body>
            <Text>All Stores</Text>
          </Body>
        </ListItem>
      ].concat(
        this._shops.map(shop => (
          <ListItem
            key={shop.id}
            onPress={() => this._toggleShopSelected(shop.id)}
          >
            <CheckBox
              value={this._isShopSelected(shop.id)}
              onValueChange={() => this._toggleShopSelected(shop.id)}
            />
            <Body>
              <Text>{shop.name || shop.title}</Text>
            </Body>
          </ListItem>
        ))
      )
    ) : (
      <View />
    );
  }

  _isShopSelected(shopId: string) {
    return shopId == "all"
      ? this.state.shops.length == this._shops.length
      : this.state.shops.some(s => s == shopId);
  }

  async _toggleShopSelected(shopId: string) {
    const shops = this._isShopSelected(shopId)
      ? this.state.shops.filter(s => s != shopId)
      : this.state.shops.concat([shopId]);
    this.setState({
      shops
    });

    await AsyncStorage.setItem("shops", JSON.stringify(shops));
  }

  async _toggleAllShopsSelected() {
    const shops =
      this.state.shops.length == this._shops.length
        ? []
        : this._shops.map(shop => shop.id);

    this.setState({ shops });

    await AsyncStorage.setItem("shops", JSON.stringify([]));
  }

  _getRegionsPicker() {
    const regions = Object.keys(this._regions || {});
    const regionItems = regions.map(region => (
      <Picker.Item key={region} label={region.toUpperCase()} value={region} />
    ));
    return regions && regions.length > 0 ? (
      <Picker
        selectedValue={this.state.region || "0"}
        onValueChange={async (region, itemIndex) => this._setRegion(region)}
      >
        <Picker.Item key={0} label="N/A" value="0" />
        {regionItems}
      </Picker>
    ) : (
      <View />
    );
  }

  async _setRegion(region: string) {
    this.setState({ region: region == "0" ? "" : region });
    await AsyncStorage.setItem("region", region);
  }
}
