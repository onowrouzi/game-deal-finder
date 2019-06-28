import React, { PureComponent } from "react";
import {
  Content,
  List,
  ListItem,
  Text,
  Body,
  Left,
  Button,
  Icon,
  Right,
  CheckBox,
  Container,
  H1,
  Item,
  Input,
  Spinner,
  H3
} from "native-base";
import { ItadShop, ItadRegions, IsThereAnyDealApi } from "itad-api-client-ts";
import { API_KEY } from "react-native-dotenv";
import { Picker, Switch, ToastAndroid, Modal, Dimensions } from "react-native";
import { Settings } from "../../types/settings";
import { DealListStyle } from "../../types/deal-list-style";
import { SettingTypes } from "../../types/setting-types.enum";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Screens } from "../../types/screens";
import ThemesUtility from "../../utilities/themes";
import SettingsUtility from "../../utilities/settings";
import LoadingScreen from "../../components/loading-screen";
import GamesSyncer from "../../utilities/syncer";
import { SyncInfo } from "../../types/sync-info";
import UserDataUtility from "../../utilities/user-data";

export default class SettingsScreen extends PureComponent<
  { navigation: any },
  Settings & {
    style: any;
    availableShops: ItadShop[];
    availableRegions: ItadRegions;
    syncInfo?: SyncInfo;
    steamProfileUrl?: string;
    modalVisible: boolean;
    syncing: boolean;
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
  private _syncer: GamesSyncer;

  constructor(props) {
    super(props);

    const settings = SettingsUtility.getSettings();
    const syncInfo = UserDataUtility.getSyncInfo().find(i => i.shop == "steam");

    this.state = {
      shops: settings.shops,
      region: settings.region,
      country: settings.country,
      includeBundles: settings.includeBundles,
      includeDlc: settings.includeDlc,
      listStyle: settings.listStyle,
      darkMode: settings.darkMode,
      style: ThemesUtility.getThemeStyles(),
      availableRegions: {},
      availableShops: [],
      syncInfo,
      steamProfileUrl: syncInfo ? syncInfo.profile_url : "",
      modalVisible: false,
      syncing: false,
      loading: true
    };

    this._api = new IsThereAnyDealApi(API_KEY);
    this._syncer = new GamesSyncer();

    this._isValidSteamProfileUrl = this._isValidSteamProfileUrl.bind(this);
    this._syncSteamLibrary = this._syncSteamLibrary.bind(this);
  }

  async componentDidMount() {
    const availableShops = await this._api.getShops();
    const availableRegions = await this._api.getRegions();

    const shops =
      this.state.shops.length === 0
        ? availableShops.map(shop => shop.id)
        : this.state.shops;

    this.setState({ shops, availableShops, availableRegions, loading: false });
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
          <ListItem key="liststyle" noBorder style={{ maxHeight: 60 }}>
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
                onValueChange={async () => this._toggleIncludeBundles()}
              />
            </Right>
          </ListItem>
          <ListItem
            key="region"
            style={{ maxHeight: 60 }}
            noBorder={this.state.region == null}
          >
            <Left>
              <Text style={this.state.style.primary}>Region</Text>
            </Left>
            <Body>{this._getRegionsPicker()}</Body>
          </ListItem>
          {this._getCountriesSection()}
          <ListItem itemDivider style={this.state.style.secondary}>
            <Text style={this.state.style.secondary}>Sync (BETA)</Text>
          </ListItem>
          <TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
          >
            <ListItem style={[this.state.style.primary]} noBorder>
              <Left>
                <Text style={[this.state.style.primary, { fontSize: 16 }]}>
                  Steam
                </Text>
              </Left>
              {(() => {
                if (this.state.syncInfo && this.state.syncInfo.last_sync) {
                  const lastSync = new Date(this.state.syncInfo.last_sync);
                  return (
                    <Body>
                      <Text
                        style={[this.state.style.primary, { fontSize: 12 }]}
                      >
                        Last Sync:
                      </Text>
                      <Text
                        note
                        numberOfLines={1}
                        style={[this.state.style.primary, { fontSize: 10 }]}
                      >
                        {lastSync.toLocaleString()}
                      </Text>
                    </Body>
                  );
                }
              })()}
              <Right>
                <Icon
                  name="sync"
                  type="AntDesign"
                  style={[this.state.style.primary, { fontSize: 16 }]}
                />
              </Right>
            </ListItem>
          </TouchableOpacity>
          <ListItem itemDivider style={this.state.style.secondary}>
            <Text style={this.state.style.secondary}>Stores</Text>
          </ListItem>
          {this._getShopsComponent()}
        </List>
        <Modal
          visible={this.state.modalVisible}
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <Container style={[this.state.style.primary, { padding: 20 }]}>
            <H1
              style={[
                this.state.style.primary,
                { textAlign: "center", marginBottom: 20 }
              ]}
            >
              STEAM SYNC
            </H1>
            <Item
              success={this._isValidSteamProfileUrl(this.state.steamProfileUrl)}
            >
              <Input
                style={[this.state.style.primary, { fontSize: 12 }]}
                placeholder="https://steamcommunity.com/profiles/123456"
                value={this.state.steamProfileUrl}
                onChangeText={steamProfileUrl =>
                  this.setState({ steamProfileUrl })
                }
                onEndEditing={this._syncSteamLibrary}
              />
              <Button
                transparent
                style={[this.state.style.primary, { fontSize: 16 }]}
                disabled={
                  !this._isValidSteamProfileUrl(this.state.steamProfileUrl)
                }
                onPress={this._syncSteamLibrary}
              >
                {(() =>
                  this.state.syncing ? (
                    <Spinner size="small" />
                  ) : (
                    <Icon name="sync" type="AntDesign" />
                  ))()}
              </Button>
            </Item>
            <Item
              style={[
                this.state.style.primary,
                { marginTop: 60, marginBottom: 20, paddingBottom: 10 }
              ]}
            >
              <Icon
                name="info"
                type="Feather"
                style={this.state.style.primary}
              />
              <H3 style={[this.state.style.primary, { textAlign: "center" }]}>
                How To Sync Steam Library
              </H3>
            </Item>
            <Item
              style={[this.state.style.primary, { borderColor: "transparent" }]}
            >
              <Text
                style={[
                  this.state.style.primary,
                  { fontSize: 12, flex: 1, flexWrap: "wrap", marginTop: 10 }
                ]}
              >
                {`Paste your profile url into the text box above.

It should look something like this:

https://steamcommunity.com/id/username
                              OR 
https://steamcommunity.com/profiles/12345678 

In order to sync your steam library it must be public.

All data gathered is persisted solely in your device's storage. 
Nothing gets sent to any cloud or server with the exception of mapping game id's to id's in IsThereAnyDeal.`}
              </Text>
            </Item>
          </Container>
        </Modal>
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
    const style = ThemesUtility.setThemeStyles(darkMode);
    this.setState({ style, loading: false });
  }

  _getShopsComponent() {
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
      this.state.availableShops.map(shop => (
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

  _isShopSelected(shopId: string) {
    return shopId == "all"
      ? this.state.shops.length == this.state.availableShops.length
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
      this.state.shops.length == this.state.availableShops.length
        ? []
        : this.state.availableShops.map(shop => shop.id);

    this.setState({ shops });

    await SettingsUtility.setSetting(SettingTypes.SHOPS, []);
  }

  _getRegionsPicker() {
    const regions = Object.keys(this.state.availableRegions || {}).sort();
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
      this.state.availableRegions[region] &&
      this.state.availableRegions[region].currency
        ? {
            sign: this.state.availableRegions[region].currency.sign,
            left: this.state.availableRegions[region].currency.left,
            code: this.state.availableRegions[region].currency.code
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
        <ListItem key="country" style={{ maxHeight: 60 }} noBorder>
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
      this.state.availableRegions[this.state.region] &&
      this.state.availableRegions[this.state.region].countries
    ) {
      const countryItems = this.state.availableRegions[
        this.state.region
      ].countries
        .sort()
        .map(country => (
          <Picker.Item key={country} label={country} value={country} />
        ));
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

  _isValidSteamProfileUrl(url: string) {
    return /^((http|https):\/\/?)((www\.)?)(steamcommunity.com\/)(id|profiles)(\/\w{3,})$/.test(
      (url || "").toLowerCase()
    );
  }

  async _syncSteamLibrary() {
    let toastMessage;

    if (this._isValidSteamProfileUrl(this.state.steamProfileUrl)) {
      this.setState({ syncing: true });

      const syncStatus = await this._syncer.syncSteamLibrary(
        this.state.steamProfileUrl
      );

      toastMessage = syncStatus.library
        ? "Successfully synced steam library!"
        : "Something went wrong...";

      const syncInfo = UserDataUtility.getSyncInfo();
      this.setState({
        syncInfo: syncInfo.find(i => i.shop == "steam"),
        syncing: false
      });
    }

    ToastAndroid.showWithGravity(
      toastMessage,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  }
}
