import { AsyncStorage } from "react-native";
import { SettingTypes } from "../types/setting-types.enum";
import { darkTheme } from "../themes/dark-theme";
import { lightTheme } from "../themes/light-theme";

export default class ThemesUtility {
  private static _styles: any;

  static init = async () => {
    if (ThemesUtility._styles) {
      return ThemesUtility._styles;
    }

    const darkModeEnabled = await AsyncStorage.getItem(
      SettingTypes.DARK_MODE,
      (err, res) => res
    ).then(res => res === "true");

    ThemesUtility._styles = darkModeEnabled ? darkTheme : lightTheme;
    return ThemesUtility._styles;
  };

  static getThemeStyles = () => {
    return ThemesUtility._styles || darkTheme;
  };

  static setThemeStyles = (darkModeEnabled: boolean) => {
    ThemesUtility._styles = darkModeEnabled ? darkTheme : lightTheme;

    return ThemesUtility._styles;
  };
}
