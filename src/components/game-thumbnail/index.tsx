import React, { PureComponent } from "react";
import { Thumbnail } from "native-base";

export default class GameThumbnailComponent extends PureComponent<
  { src: string },
  {}
> {
  render() {
    return (
      <Thumbnail
        square
        resizeMode={"contain"}
        large
        source={{
          uri:
            this.props.src ||
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/No_picture_available.png/401px-No_picture_available.png"
        }}
      />
    );
  }
}
