import React, { PureComponent } from "react";
import {
  View,
  Content,
  List,
  ListItem,
  Text,
  Body,
  Left,
  Spinner,
  Button,
  Icon,
  Container,
  Right,
  CheckBox
} from "native-base";
import { ItadShop, ItadRegions, IsThereAnyDealApi } from "itad-api-client-ts";
import { API_KEY } from "react-native-dotenv";
import { Picker, Switch } from "react-native";
import { Settings } from "../../types/settings";
import { DealListStyle } from "../../types/deal-list-style";
import { SettingTypes } from "../../types/setting-types.enum";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "..";
import { Themes } from "../../services/themes";
import SettingsUtility from "../../services/settings";
import { LoadingScreen } from "../../components/loading-screen";

export default class SettingsScreen extends PureComponent<
  { navigation: any },
  Settings & {
    style: any;
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
      style: {},
      loading: true
    };

    this._api = new IsThereAnyDealApi(API_KEY);
  }

  async componentDidMount() {
    const settings = SettingsUtility.getSettings();

    const style = Themes.getThemeStyles();
    this.setState({ style });

    const shopsListPromise = this._api.getShops();
    const regionsListPromise = this._api.getRegions();

    const resolved = await Promise.all([shopsListPromise, regionsListPromise]);

    this._shops = resolved[0];
    this._regions = resolved[1];

    this.setState({
      shops:
        settings.shops.length > 0
          ? settings.shops
          : this._shops.map(shop => shop.id),
      region: settings.region,
      country: settings.country,
      includeBundles: settings.includeBundles,
      includeDlc: settings.includeDlc,
      listStyle: settings.listStyle,
      darkMode: settings.darkMode,
      loading: false
    });
  }

  async _toggleIncludeBundles() {
    const includeBundles = !this.state.includeBundles;
    this.setState({ includeBundles });

    await SettingsUtility.setSetting(
      SettingTypes.INCLUDE_BUNDLES,
      includeBundles
    );
  }

  async _toggleIncludeDlc() {
    const includeDlc = !this.state.includeDlc;
    this.setState({ includeDlc });

    await SettingsUtility.setSetting(SettingTypes.INCLUDE_DLC, includeDlc);
  }

  render() {
    return this.state.loading ? (
      <LoadingScreen />
    ) : (
      <Content style={this.state.style.primary}>
        <List>
          <ListItem itemDivider style={this.state.style.secondary}>
            <Text style={this.state.style.secondary}>Appearance</Text>
          </ListItem>
          <ListItem key={"dark_mode"}>
            <Left>
              <Text style={this.state.style.primary}>Dark Mode</Text>
            </Left>
            <Right>
              <Switch
                value={this.state.darkMode}
                onValueChange={() => this._toggleDarkMode()}
              />
            </Right>
          </ListItem>
          <ListItem key="liststyle">
            <Left>
              <Text style={this.state.style.primary}>List Style</Text>
            </Left>
            <Body>
              <Picker
                style={this.state.style.primary}
                itemStyle={this.state.style.primary}
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
          <ListItem itemDivider style={this.state.style.secondary}>
            <Text style={this.state.style.secondary}>General</Text>
          </ListItem>
          <ListItem key={"include_dlc"}>
            <Left>
              <Text style={this.state.style.primary}>Include DLC</Text>
            </Left>
            <Right>
              <Switch
                value={this.state.includeDlc}
                onValueChange={async => this._toggleIncludeDlc()}
              />
            </Right>
          </ListItem>
          <ListItem key={"include_bundles"} style={this.state.style.primary}>
            <Left>
              <Text style={this.state.style.primary}>Include Bundles</Text>
            </Left>
            <Right>
              <Switch
                value={this.state.includeBundles}
                onValueChange={async => this._toggleIncludeBundles()}
              />
            </Right>
          </ListItem>
          <ListItem key="region" style={this.state.style.primary}>
            <Left>
              <Text style={this.state.style.primary}>Region</Text>
            </Left>
            <Body>{this._getRegionsPicker()}</Body>
          </ListItem>
          {this._getCountriesSection()}
          <ListItem itemDivider style={this.state.style.secondary}>
            <Text style={this.state.style.secondary}>Stores</Text>
          </ListItem>
          {this._getShopsComponent()}
        </List>
      </Content>
    );
  }

  async _setListStyle(listStyle: DealListStyle) {
    this.setState({ listStyle });
    await SettingsUtility.setSetting(SettingTypes.LIST_STYLE, listStyle);
  }

  async _toggleDarkMode() {
    const darkMode = !this.state.darkMode;
    this.setState({ darkMode, loading: true });
    await SettingsUtility.setSetting(SettingTypes.DARK_MODE, darkMode);
    const style = Themes.setThemeStyles(darkMode);
    this.setState({ style, loading: false });
  }

  _getShopsComponent() {
    if (this._shops) {
      return [
        <ListItem key="all" style={this.state.style.primary}>
          <CheckBox
            color={this.state.style.checkbox.color}
            checked={this._isShopSelected("all")}
            onPress={() => this._toggleAllShopsSelected()}
          />
          <Body>
            <Text style={this.state.style.primary}>All Stores</Text>
          </Body>
        </ListItem>
      ].concat(
        this._shops.map(shop => (
          <ListItem
            style={this.state.style.primary}
            key={shop.id}
            onPress={() => this._toggleShopSelected(shop.id)}
          >
            <CheckBox
              color={this.state.style.checkbox.color}
              checked={this._isShopSelected(shop.id)}
              onPress={() => this._toggleShopSelected(shop.id)}
            />
            <Body>
              <Text style={this.state.style.primary}>
                {shop.name || shop.title}
              </Text>
            </Body>
          </ListItem>
        ))
      );
    }
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

    await SettingsUtility.setSetting(SettingTypes.SHOPS, shops);
  }

  async _toggleAllShopsSelected() {
    const shops =
      this.state.shops.length == this._shops.length
        ? []
        : this._shops.map(shop => shop.id);

    this.setState({ shops });

    await SettingsUtility.setSetting(SettingTypes.SHOPS, []);
  }

  _getRegionsPicker() {
    const regions = Object.keys(this._regions || {});
    if (regions && regions.length > 0) {
      const regionItems = regions.map(region => (
        <Picker.Item key={region} label={region.toUpperCase()} value={region} />
      ));
      return (
        <Picker
          style={this.state.style.primary}
          itemStyle={{ backgroundColor: "#333" }}
          selectedValue={this.state.region || "0"}
          onValueChange={async (region, itemIndex) => this._setRegion(region)}
        >
          <Picker.Item key={0} label="N/A" value="0" />
          {regionItems}
        </Picker>
      );
    }
  }

  async _setRegion(region: string) {
    let promises = [];
    this.setState({ region: region == "0" ? "" : region });
    promises.push(SettingsUtility.setSetting(SettingTypes.REGION, region));
    if (region == "0") {
      promises.push(SettingsUtility.setSetting(SettingTypes.COUNTRY, ""));
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

    promises.push(SettingsUtility.setSetting(SettingTypes.CURRENCY, currency));

    await Promise.all(promises);
  }

  _getCountriesSection() {
    if (this.state.region) {
      return (
        <ListItem key="country" style={this.state.style.primary}>
          <Left>
            <Text style={this.state.style.primary}>Country</Text>
          </Left>
          <Body>{this._getCountriesPicker()}</Body>
        </ListItem>
      );
    }
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
          style={[this.state.style.primary, { textAlign: "right" }]}
          itemStyle={[this.state.style.primary, { textAlign: "right" }]}
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
    await SettingsUtility.setSetting(SettingTypes.COUNTRY, country);
  }
}
