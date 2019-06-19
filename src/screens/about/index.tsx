import React, { PureComponent } from "react";
import {
  Content,
  Card,
  CardItem,
  Left,
  Thumbnail,
  Body,
  Button,
  Icon,
  Text,
  H1
} from "native-base";
import { Image } from "react-native";

export default class AboutScreen extends PureComponent<
  { navigation: any },
  {}
> {
  render() {
    return (
      <Content>
        <Card style={{ paddingBottom: 10 }}>
          <CardItem header bordered>
            <Text style={{ fontSize: 20, color: "#000" }}>
              Game Deal Finder
            </Text>
          </CardItem>
          <CardItem>
            <Body>
              <Text note>
                This app was made with React Native as a hobby project utlizing
                data from IsThereAnyDeal.
              </Text>
            </Body>
          </CardItem>
          <CardItem>
            <Body>
              <Text note>
                This project, however, is not officially affiliated with
                IsThereAnyDeal in any capacity.
              </Text>
            </Body>
          </CardItem>
        </Card>
        <Card>
          <CardItem>
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
                <Icon name="link" />
                <Text uppercase={false}>
                  Data retrieved utilizing the IsThereAnyDeal API.
                </Text>
              </Button>
            </Body>
          </CardItem>
        </Card>
        <Card>
          <CardItem>
            <Left>
              <Button
                transparent
                onPress={() =>
                  this.props.navigation.navigate("Webview", {
                    uri: "https://github.com/onowrouzi/game-deal-finder",
                    title: "Github"
                  })
                }
              >
                <Icon name="logo-github" />
                <Text uppercase={false}>Open source, always and forever!</Text>
              </Button>
            </Left>
          </CardItem>
        </Card>
      </Content>
    );
  }
}
