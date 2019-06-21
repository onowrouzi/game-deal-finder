import { AsyncStorage } from "react-native";
import { SettingTypes } from "../types/setting-types.enum";
import { darkTheme } from "../themes/dark-theme";
import { lightTheme } from "../themes/light-theme";

export class Themes {
  private static _styles: any;

  static init = async () => {
    if (Themes._styles) {
      return Themes._styles;
    }

    const darkModeEnabled = await AsyncStorage.getItem(
      SettingTypes.DARK_MODE,
      (err, res) => res
    ).then(res => res === "true");

    Themes._styles = darkModeEnabled ? darkTheme : lightTheme;
    return Themes._styles;
  };

  static getThemeStyles = () => {
    return Themes._styles || darkTheme;
  };

  static setThemeStyles = (darkModeEnabled: boolean) => {
    Themes._styles = darkModeEnabled ? darkTheme : lightTheme;

    return Themes._styles;
  };
}
