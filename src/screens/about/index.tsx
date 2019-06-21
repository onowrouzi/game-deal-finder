import React, { PureComponent } from "react";
import {
  Content,
  Card,
  CardItem,
  Left,
  Body,
  Button,
  Icon,
  Text
} from "native-base";
import MenuButton from "../../components/menu-button";
import { Screens } from "..";
import { Themes } from "../../services/themes";

export default class AboutScreen extends PureComponent<
  { navigation: any },
  { style: any }
> {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: <MenuButton navigation={navigation} />
  });
  constructor(props) {
    super(props);

    this.state = {
      style: {}
    };
    this._setStyles = this._setStyles.bind(this);
  }

  async componentDidMount() {
    this._setStyles();

    this.props.navigation.addListener("willFocus", this._setStyles);
  }

  _setStyles() {
    const style = Themes.getThemeStyles();
    this.setState({ style });
  }

  render() {
    return (
      <Content style={this.state.style.primary}>
        <Card style={[this.state.style.primary, { paddingBottom: 10 }]}>
          <CardItem header bordered style={this.state.style.primary}>
            <Text style={[this.state.style.primary, { fontSize: 20 }]}>
              Game Deal Finder
            </Text>
          </CardItem>
          <CardItem style={this.state.style.primary}>
            <Body>
              <Text note style={this.state.style.primary}>
                This app was made with React Native as a hobby project utlizing
                data from IsThereAnyDeal.
              </Text>
            </Body>
          </CardItem>
          <CardItem style={this.state.style.primary}>
            <Body>
              <Text note style={this.state.style.primary}>
                This project, however, is not officially affiliated with
                IsThereAnyDeal in any capacity.
              </Text>
            </Body>
          </CardItem>
        </Card>
        <Card style={this.state.style.primary}>
          <CardItem style={this.state.style.primary}>
            <Body>
              <Button
                transparent
                onPress={() =>
                  this.props.navigation.push("Webview", {
                    uri: "https://isthereanydeal.com",
                    title: "Is There Any Deal?"
                  })
                }
              >
                <Icon name="link" style={this.state.style.link} />
                <Text
                  uppercase={false}
                  style={[this.state.style.link, { fontSize: 12 }]}
                >
                  Data retrieved utilizing the IsThereAnyDeal API.
                </Text>
              </Button>
            </Body>
          </CardItem>
        </Card>
        <Card style={this.state.style.primary}>
          <CardItem style={this.state.style.primary}>
            <Left>
              <Button
                transparent
                onPress={() =>
                  this.props.navigation.navigate(Screens.Webview, {
                    uri: "https://github.com/onowrouzi/game-deal-finder",
                    title: "Github"
                  })
                }
              >
                <Icon name="logo-github" style={this.state.style.link} />
                <Text
                  uppercase={false}
                  style={[this.state.style.link, { fontSize: 12 }]}
                >
                  Open source, always and forever!
                </Text>
              </Button>
            </Left>
          </CardItem>
        </Card>
      </Content>
    );
  }
}
