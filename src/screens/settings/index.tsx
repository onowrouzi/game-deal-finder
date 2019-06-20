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
  Spinner,
  Button,
  Icon
} from "native-base";
import { ItadShop, ItadRegions, IsThereAnyDealApi } from "itad-api-client-ts";
import { API_KEY } from "react-native-dotenv";
import { Switch, CheckBox, AsyncStorage } from "react-native";
import { Settings } from "../../types/settings";
import { DealListStyle } from "../../types/deal-list-style";
import { SettingTypes } from "../../types/setting-types.enum";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "..";

export default class SettingsScreen extends PureComponent<
  {},
  Settings & {
    loading: boolean;
  }
> {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: (
      <TouchableOpacity>
        <Button
          transparent
          light
          onPress={() => navigation.navigate(Screens.Deals)}
        >
          <Icon name="arrow-back" />
        </Button>
      </TouchableOpacity>
    )
  });

  private _api: IsThereAnyDealApi;
  private _shops: ItadShop[];
  private _regions: ItadRegions;

  constructor(props) {
    super(props);

    this.state = {
      includeBundles: false,
      includeDlc: false,
      listStyle: "list",
      shops: [],
      loading: true
    };

    this._api = new IsThereAnyDealApi(API_KEY);
  }

  async componentDidMount() {
    const shopsListPromise = this._api.getShops();
    const regionsListPromise = this._api.getRegions();

    const shopsPromise = AsyncStorage.getItem(
      SettingTypes.SHOPS,
      (err, res) => res
    ).then(res => JSON.parse(res) || []);
    const regionPromise = AsyncStorage.getItem(
      SettingTypes.REGION,
      (err, res) => res
    );
    const countryPromise = AsyncStorage.getItem(
      SettingTypes.COUNTRY,
      (err, res) => res
    );
    const includeBundlesPromise = AsyncStorage.getItem(
      SettingTypes.INCLUDE_BUNDLES,
      (err, res) => res
    ).then(res => !(res === "false"));
    const includeDlcPromise = AsyncStorage.getItem(
      SettingTypes.INCLUDE_DLC,
      (err, res) => res
    ).then(res => !(res === "true"));
    const listStylePromise = AsyncStorage.getItem(
      SettingTypes.LIST_STYLE,
      (err, res) => res
    ).then(res => res as DealListStyle);

    const resolved = await Promise.all([
      shopsListPromise,
      regionsListPromise,
      shopsPromise,
      regionPromise,
      countryPromise,
      includeBundlesPromise,
      includeDlcPromise,
      listStylePromise
    ]);

    this._shops = resolved[0];
    this._regions = resolved[1];

    this.setState({
      shops:
        resolved[2].length > 0 ? resolved[2] : this._shops.map(shop => shop.id),
      region: resolved[3],
      country: resolved[4],
      includeBundles: resolved[5],
      includeDlc: resolved[6],
      listStyle: resolved[7],
      loading: false
    });
  }

  async _toggleIncludeBundles() {
    const includeBundles = !this.state.includeBundles;
    this.setState({ includeBundles });

    await AsyncStorage.setItem(
      SettingTypes.INCLUDE_BUNDLES,
      JSON.stringify(includeBundles)
    );
  }

  async _toggleIncludeDlc() {
    const includeDlc = !this.state.includeDlc;
    this.setState({ includeDlc });

    await AsyncStorage.setItem(
      SettingTypes.INCLUDE_DLC,
      JSON.stringify(includeDlc)
    );
  }

  render() {
    return this.state.loading ? (
      <Spinner />
    ) : (
      <Content>
        <List>
          <ListItem itemDivider>
            <Text>Appearance</Text>
          </ListItem>
          <ListItem key="liststyle">
            <Left>
              <Text>List Style</Text>
            </Left>
            <Body>
              <Picker
                selectedValue={this.state.listStyle || "0"}
                onValueChange={async (listStyle, itemIndex) =>
                  this._setListStyle(listStyle)
                }
              >
                <Picker.Item key="liststyle_list" label="List" value="list" />
                <Picker.Item key="liststyle_card" label="Card" value="card" />
              </Picker>
            </Body>
          </ListItem>
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
          {this._getCountriesSection()}
          <ListItem itemDivider>
            <Text>Stores</Text>
          </ListItem>
          {this._getShopsComponent()}
        </List>
      </Content>
    );
  }

  async _setListStyle(listStyle: DealListStyle) {
    this.setState({ listStyle });
    await AsyncStorage.setItem(SettingTypes.LIST_STYLE, listStyle);
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

    await AsyncStorage.setItem(SettingTypes.SHOPS, JSON.stringify(shops));
  }

  async _toggleAllShopsSelected() {
    const shops =
      this.state.shops.length == this._shops.length
        ? []
        : this._shops.map(shop => shop.id);

    this.setState({ shops });

    await AsyncStorage.setItem(SettingTypes.SHOPS, JSON.stringify([]));
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
    let promises = [];
    this.setState({ region: region == "0" ? "" : region });
    promises.push(AsyncStorage.setItem(SettingTypes.REGION, region));
    if (region == "0") {
      promises.push(AsyncStorage.setItem(SettingTypes.COUNTRY, ""));
    }

    const currency =
      this._regions[region] && this._regions[region].currency
        ? {
            sign: this._regions[region].currency.sign,
            left: this._regions[region].currency.left,
            code: this._regions[region].currency.code
          }
        : {
            sign: "",
            left: true,
            code: ""
          };

    promises.push(
      AsyncStorage.setItem(SettingTypes.CURRENCY, JSON.stringify(currency))
    );

    await Promise.all(promises);
  }

  _getCountriesSection() {
    return this.state.region ? (
      <ListItem key="country">
        <Left>
          <Text>Country</Text>
        </Left>
        <Body>{this._getCountriesPicker()}</Body>
      </ListItem>
    ) : (
      <View />
    );
  }

  _getCountriesPicker() {
    if (
      this.state.region &&
      this._regions[this.state.region] &&
      this._regions[this.state.region].countries
    ) {
      const countryItems = this._regions[this.state.region].countries.map(
        country => <Picker.Item key={country} label={country} value={country} />
      );
      return (
        <Picker
          selectedValue={this.state.country || "0"}
          onValueChange={async (country, itemIndex) =>
            this._setCountry(country)
          }
        >
          <Picker.Item key={0} label="N/A" value="0" />
          {countryItems}
        </Picker>
      );
    }
  }

  async _setCountry(country: string) {
    this.setState({ country: country == "0" ? "" : country });
    await AsyncStorage.setItem(SettingTypes.COUNTRY, country);
  }
}
