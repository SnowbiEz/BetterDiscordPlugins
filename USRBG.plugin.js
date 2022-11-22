/**
 * @name USRBG
 * @author Ahlawat
 * @authorId 887483349369765930
 * @version 1.0.3
 * @invite SgKSKyh9gY
 * @description User profile backgrounds for BetterDiscord. (Banners are fetched from the USRBG database.)
 * @website https://tharki-god.github.io/
 * @source https://github.com/Tharki-God/BetterDiscordPlugins
 * @updateUrl https://raw.githubusercontent.com/Tharki-God/BetterDiscordPlugins/master/USRBG.plugin.js
 */
/*@cc_on
	@if (@_jscript)	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
	shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
	shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
	fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
	// Show the user where to put plugins in the future
	shell.Exec("explorer " + pathPlugins);
	shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/
module.exports = (() => {
  const config = {
    info: {
      name: "USRBG",
      authors: [
        {
          name: "Ahlawat",
          discord_id: "887483349369765930",
          github_username: "Tharki-God",
        },
      ],
      version: "1.0.3",
      description: "User profile backgrounds for BetterDiscord. (Banners are fetched from the USRBG database.)",
      github: "https://github.com/Tharki-God/BetterDiscordPlugins",
      github_raw:
        "https://raw.githubusercontent.com/Tharki-God/BetterDiscordPlugins/master/USRBG.plugin.js",
    },
    changelog: [
      {
        title: "v0.0.1",
        items: ["Idea in mind"],
      },
      {
        title: "v0.0.5",
        items: ["Base Model"],
      },
      {
        title: "Initial Release v1.0.0",
        items: [
          "This is the initial release of the plugin :)",
          "Ah my last plugin before i die ...(*￣０￣)ノ",
        ],
      },
      {
        title: "v1.0.2",
        items: ["Corrected text."],
      },
      {
        title: "v1.0.3",
        items: [
          "Added Indicator for USRBG Banners",
        ],
      },
    ],
    main: "USRBG.plugin.js",
  };
  return !window.hasOwnProperty("ZeresPluginLibrary")
    ? class {
        load() {
          BdApi.showConfirmationModal(
            "ZLib Missing",
            `The library plugin (ZeresPluginLibrary) needed for ${config.info.name} is missing. Please click Download Now to install it.`,
            {
              confirmText: "Download Now",
              cancelText: "Cancel",
              onConfirm: () => this.downloadZLib(),
            }
          );
        }
        async downloadZLib() {
          const fs = require("fs");
          const path = require("path");
          const ZLib = await fetch(
            "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"
          );
          if (!ZLib.ok) return this.errorDownloadZLib();
          const ZLibContent = await ZLib.text();
          try {
            await fs.writeFile(
              path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
              ZLibContent,
              (err) => {
                if (err) return this.errorDownloadZLib();
              }
            );
          } catch (err) {
            return this.errorDownloadZLib();
          }
        }
        errorDownloadZLib() {
          const { shell } = require("electron");
          BdApi.showConfirmationModal(
            "Error Downloading",
            [
              `ZeresPluginLibrary download failed. Manually install plugin library from the link below.`,
            ],
            {
              confirmText: "Download",
              cancelText: "Cancel",
              onConfirm: () => {
                shell.openExternal(
                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"
                );
              },
            }
          );
        }
        start() {}
        stop() {}
      }
    : (([Plugin, Library]) => {
        const {
          WebpackModules,
          PluginUpdater,
          Logger,
          Patcher,
          Utilities,
          DiscordModules: { React, Tooltip, InviteActions },
          Settings: { SettingPanel, Switch, RadioGroup },
        } = Library;
        const USBBG_SERVER_INVITE_CODE = "TeRQEPb";
        const USRBG_URL =
          "https://raw.githubusercontent.com/Discord-Custom-Covers/usrbg/master/dist/usrbg.json";
        const UserBannerParentModules = WebpackModules.getModules((m) =>
          ["profileType", "displayProfile"].every((s) =>
            m?.Z?.toString().includes(s)
          )
        );
        const UserPopoutAvatar = WebpackModules.getModule((m) =>
          ["isNonUserBot", "avatarHintInnerText", "avatarDecorationHint"].every(
            (s) => m?.tZ?.toString().includes(s)
          )
        );
        const UserThemedPopoutAvatar = WebpackModules.getModule((m) =>
          [".avatarPositionPremiumNoBanner", "VIEW_PROFILE"].every((s) =>
            m?.tZ?.toString().includes(s)
          )
        );
        const { iconItem, actionIcon } = WebpackModules.getByProps("iconItem");
        const defaultSettings = Object.freeze({
          nitroBanner: true,
          style: 2,
        });

        return class USRBG extends Plugin {
          constructor() {
            super();
            this.settings = Utilities.loadData(
              config.info.name,
              "settings",
              defaultSettings
            );
          }
          checkForUpdates() {
            try {
              PluginUpdater.checkForUpdate(
                config.info.name,
                config.info.version,
                config.info.github_raw
              );
            } catch (err) {
              Logger.err("Plugin Updater could not be reached.", err);
            }
          }
          start() {
            this.checkForUpdates();
            this.applyPatches();
          }
          async getUSRBG() {
            const response = await fetch(USRBG_URL);
            const json = await response.json();
            return new Map(json.map((user) => [user.uid, user]));
          }
          async applyPatches() {
            const USRDB = await this.getUSRBG();
            for (const UserBannerModule of UserBannerParentModules) {
              Patcher.before(UserBannerModule, "Z", (_, [args]) => {
                if (
                  !USRDB.has(args.user.id) ||
                  (args?.displayProfile?.premiumType &&
                    this.settings["nitroBanner"])
                )
                  return;
                const img = USRDB.get(args.user.id)?.img;
                args.bannerSrc = img;
                if (!args.displayProfile) return;
                Patcher.instead(args.displayProfile, "getBannerURL", () => img);
              });
              Patcher.after(UserBannerModule, "Z", (_, [args], res) => {
                if (
                  !USRDB.has(args.user.id) ||
                  (args?.displayProfile?.premiumType &&
                    this.settings["nitroBanner"])
                )
                  return;
                res.props.isPremium = true;
                res.props.profileType = this.settings["style"];
                res.props.children.props.children = [
                  React.createElement(
                    Tooltip,
                    {
                      text: "USRBG Banner",
                    },
                    (props) =>
                      React.createElement(
                        "div",
                        {
                          ...props,
                          className: `${iconItem} usr-bg-icon-clickable`,
                          onClick: () =>
                            InviteActions.acceptInviteAndTransitionToInviteChannel(
                              { inviteKey: USBBG_SERVER_INVITE_CODE }
                            ),
                          style: {
                            display: "block",
                            margin: "0.001% 0%  0% 93%",
                          },
                        },
                        React.createElement(
                          "svg",
                          {
                            class: actionIcon,
                            viewBox: "0 0 24 24",
                          },
                          React.createElement("path", {
                            fill: "currentColor",
                            d: "M6 16.938v2.121L5.059 20h-2.12L6 16.938Zm16.002-2.503v2.122L18.56 20h-.566v-1.557l4.008-4.008ZM8.75 14h6.495a1.75 1.75 0 0 1 1.744 1.607l.006.143V20H7v-4.25a1.75 1.75 0 0 1 1.606-1.744L8.75 14Zm-.729-3.584c.06.579.243 1.12.523 1.6L2 18.56v-2.122l6.021-6.022Zm13.98-.484v2.123l-4.007 4.01v-.315l-.004-.168a2.734 2.734 0 0 0-.387-1.247l4.399-4.403ZM12.058 4 2 14.06v-2.121L9.936 4h2.12Zm9.945 1.432v2.123l-5.667 5.67a2.731 2.731 0 0 0-.86-.216l-.23-.009h-.6a4.02 4.02 0 0 0 .855-1.062l6.502-6.506ZM12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM7.559 4l-5.56 5.56V7.438L5.439 4h2.12Zm13.498 0-5.148 5.149a3.98 3.98 0 0 0-.652-1.47L18.935 4h2.122Zm-4.498 0-2.544 2.544a3.974 3.974 0 0 0-1.6-.522L14.438 4h2.122Z",
                          })
                        )
                      )
                  ),
                ];
              });
            }
            Patcher.before(UserThemedPopoutAvatar, "ZP", (_, [args]) => {
              if (
                !USRDB.has(args.user.id) ||
                (args?.displayProfile?.premiumType &&
                  this.settings["nitroBanner"])
              )
                return;
              args.displayProfile.banner = "_";
            });
            Patcher.before(UserPopoutAvatar, "tZ", (_, [args]) => {
              if (
                !USRDB.has(args.user.id) ||
                (args?.displayProfile?.premiumType &&
                  this.settings["nitroBanner"])
              )
                return;
              args.displayProfile.banner = "_";
            });
          }

          onStop() {
            Patcher.unpatchAll();
          }
          getSettingsPanel() {
            return SettingPanel.build(
              this.saveSettings.bind(this),
              new Switch(
                "Priorities",
                "Prioritize Nitro banner.",
                this.settings["nitroBanner"],
                (e) => {
                  this.settings["nitroBanner"] = e;
                }
              ),
              new RadioGroup(
                "Avatar style",
                "Avatar and banner styling.",
                this.settings["style"],
                [
                  {
                    name: "Attached with banner",
                    value: 2,
                  },
                  {
                    name: "With border around avatar",
                    value: 0,
                  },
                ],
                (e) => {
                  this.settings["style"] = e;
                }
              )
            );
          }
        };
        return plugin(Plugin, Library);
      })(window.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/