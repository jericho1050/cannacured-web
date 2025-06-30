import { lazy } from "solid-js";
import { ExperimentIds } from "./experiments";

export interface Setting {
  path: string;
  routePath: string;
  name: string;
  icon: string;
  element: any;
  hide?: boolean;
  hideHeader?: boolean;
  experimentId?: ExperimentIds;
}

const DeveloperApplicationBotSettings = lazy(
  () =>
    import("@/components/settings/developer/DeveloperApplicationBotSettings")
);

const settings: Setting[] = [
  {
    path: "account",
    routePath: "/account",
    name: "settings.drawer.account",
    icon: "account_circle",
    element: lazy(() => import("@/components/settings/AccountSettings")),
  },

  {
    path: "/account/profile",
    routePath: "/account/profile",
    name: "settings.drawer.account",
    icon: "account_circle",
    element: lazy(() => import("@/components/settings/ProfileSettings")),
    hide: true,
  },
  // {
  //   path: "badges",
  //   routePath: "/badges",
  //   name: "settings.drawer.badges",
  //   icon: "local_police",
  //   element: lazy(() => import("@/components/settings/BadgeSettings")),
  // },
  {
    path: "interface",
    routePath: "/interface",
    name: "settings.drawer.interface",
    icon: "brush",
    element: lazy(() => import("@/components/settings/InterfaceSettings")),
  },
  {
    path: "/interface/custom-css",
    routePath: "/interface/custom-css",
    name: "settings.drawer.interface",
    icon: "code",
    element: lazy(() => import("@/components/settings/CustomCssSettings")),
    hide: true,
  },
  {
    path: "notifications",
    routePath: "/notifications",
    name: "settings.drawer.notifications",
    icon: "notifications",
    element: lazy(() => import("@/components/settings/NotificationsSettings")),
  },
  // {
  //   path: "call-settings",
  //   routePath: "/call-settings",
  //   name: "settings.drawer.call-settings",
  //   icon: "call",
  //   element: lazy(() => import("@/components/settings/CallSettings")),
  // },
  {
    path: "connections",
    routePath: "/connections",
    name: "settings.drawer.connections",
    icon: "hub",
    element: lazy(() => import("@/components/settings/ConnectionsSettings")),
  },
  {
    path: "privacy",
    routePath: "/privacy",
    name: "settings.drawer.privacy",
    icon: "shield",
    element: lazy(() => import("@/components/settings/PrivacySettings")),
  },
  {
    path: "window-settings",
    routePath: "/window-settings",
    name: "settings.drawer.window-settings",
    icon: "launch",
    element: lazy(() => import("@/components/settings/WindowSettings")),
  },
  {
    path: "activity-status",
    routePath: "/activity-status",
    name: "settings.drawer.activity-status",
    icon: "games",
    element: lazy(() => import("@/components/settings/ActivityStatus")),
  },
  {
    path: "language",
    routePath: "/language",
    name: "settings.drawer.language",
    icon: "flag",
    element: lazy(() => import("@/components/settings/LanguageSettings")),
  },
  // {
  //   path: "developer",
  //   routePath: "/developer",
  //   name: "settings.drawer.developer",
  //   icon: "code",
  //   element: lazy(
  //     () => import("@/components/settings/developer/DeveloperSettings")
  //   ),
  // },
  // {
  //   path: "developer/applications",
  //   routePath: "/developer/applications",
  //   name: "settings.drawer.developer",
  //   icon: "code",
  //   hide: true,
  //   element: lazy(
  //     () =>
  //       import("@/components/settings/developer/DeveloperApplicationsSettings")
  //   ),
  // },
  // {
  //   path: "developer/applications",
  //   routePath: "/developer/applications/:id",
  //   name: "settings.drawer.developer",
  //   hideHeader: true,
  //   icon: "code",
  //   hide: true,
  //   element: lazy(
  //     () =>
  //       import("@/components/settings/developer/DeveloperApplicationSettings")
  //   ),
  // },
  // {
  //   path: "developer/applications",
  //   routePath: "/developer/applications/:id/bot/create-link",
  //   name: "settings.drawer.developer",
  //   hideHeader: true,
  //   icon: "code",
  //   hide: true,
  //   element: lazy(
  //     () =>
  //       import(
  //         "@/components/settings/developer/DeveloperApplicationBotCreateLinkSettings"
  //       )
  //   ),
  // },
  // {
  //   path: "developer/applications",
  //   routePath: "/developer/applications/:id/bot/profile",
  //   name: "settings.drawer.developer",
  //   hideHeader: true,
  //   icon: "code",
  //   hide: true,
  //   element: DeveloperApplicationBotSettings,
  // },

  // {
  //   path: "developer/applications",
  //   routePath: "/developer/applications/:id/bot",
  //   name: "settings.drawer.developer",
  //   hideHeader: true,
  //   icon: "code",
  //   hide: true,
  //   element: DeveloperApplicationBotSettings,
  // },
  {
    path: "experiments",
    routePath: "/experiments",
    name: "settings.drawer.experiments",
    icon: "science",
    element: lazy(() => import("@/components/settings/ExperimentSettings")),
  },
  {
    path: "tickets",
    routePath: "/tickets/:id?",
    name: "settings.drawer.tickets",
    icon: "sell",
    element: lazy(() => import("@/components/settings/TicketSettings")),
  },
];

export default settings;
