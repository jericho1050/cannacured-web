import Icon from "@/components/ui/icon/Icon";
import { A, useMatch } from "solid-navigator";
import { For, JSXElement, Match, Show, Switch } from "solid-js";
import useStore from "@/chat-api/store/useStore";
import settings from "@/common/Settings";
import ItemContainer from "@/components/ui/LegacyItem";
import { css, styled } from "solid-styled-components";
import Text from "@/components/ui/Text";
import { FlexColumn } from "../ui/Flexbox";
import env from "@/common/env";
import { useCustomPortal } from "../ui/custom-portal/CustomPortal";
import { ChangelogModal } from "../ChangelogModal";
import { clearCache } from "@/common/localCache";
import { DrawerHeader } from "../drawer-header/DrawerHeader";
import { useTransContext } from "@mbarzda/solid-i18next";
import { t } from "i18next";
import InVoiceActions from "../InVoiceActions";
import { ShowExperiment } from "@/common/experiments";
import { logout } from "@/common/logout";
import { useCustomScrollbar } from "../custom-scrollbar/CustomScrollbar";
import { SupportBlock } from "../SupportBlock";

const DrawerContainer = styled(FlexColumn)`
  height: 100%;
  &[data-scrollbar-visible="true"] {
    margin-right: 8px;
  }
`;

const SettingsListContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const SettingItemContainer = styled(ItemContainer)<{ nested?: boolean }>`
  height: 32px;
  gap: 5px;
  padding-left: ${(props) => (props.nested ? "25px" : "10px")};
  margin-left: 3px;
  margin-right: 3px;
  :first {
    background-color: red;
  }

  .label {
    opacity: ${(props) => (props.selected ? 1 : 0.6)};
    font-size: 14px;
    transition: 0.2s;
    color: white;
  }

  &:hover .label {
    opacity: 1;
  }
`;

const FooterContainer = styled(FlexColumn)`
  padding-bottom: 2px;
  margin-top: 8px;
  position: sticky;
  bottom: 0;
  background-color: var(--side-pane-color);
`;

function Footer() {
  const [t] = useTransContext();
  const { createPortal } = useCustomPortal();

  const onChangelogClick = () =>
    createPortal?.((close) => <ChangelogModal close={close} />);

  const onLogoutClick = async () => {
    await clearCache();
    logout();
  };

  return (
    <FooterContainer gap={2}>
      <SupportBlock />
      {/* <FooterItem
        href="https://github.com/Nerimity/Nerimity-Web"
        external
        icon="code"
        label={t("settings.drawer.viewSource")}
      /> */}
      <FooterItem
        icon="description"
        label={t("settings.drawer.changelog")}
        subLabel={env.APP_VERSION || "Unknown"}
        onClick={onChangelogClick}
      />
      <FooterItem
        color="var(--alert-color)"
        icon="logout"
        label={t("settings.drawer.logout")}
        onClick={onLogoutClick}
      />
      <InVoiceActions />
    </FooterContainer>
  );
}

export default function SettingsDrawer() {
  const { isVisible } = useCustomScrollbar();

  return (
    <>
      <DrawerHeader text={t("settings.drawer.title")} />
      <DrawerContainer data-scrollbar-visible={isVisible()}>
        <SettingsList />
        <Footer />
      </DrawerContainer>
    </>
  );
}

function SettingsList() {
  const { tickets } = useStore();
  const [t] = useTransContext();
  return (
    <SettingsListContainer>
      <For each={settings.filter((setting) => !setting.hide)}>
        {(setting) => (
          <ShowExperiment id={setting.experimentId}>
            <Item
              path={setting.path || "#  "}
              icon={setting.icon}
              label={t(setting.name)}
            >
              <Show
                when={
                  setting.path === "tickets" && tickets.hasTicketNotification()
                }
              >
                <NotificationCircle />
              </Show>
            </Item>
          </ShowExperiment>
        )}
      </For>
    </SettingsListContainer>
  );
}

function NotificationCircle() {
  return (
    <div
      style={{
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        background: "var(--alert-color)",
        "border-radius": "50%",
        color: "white",
        width: "20px",
        height: "20px",
        "font-size": "14px",
        "margin-left": "auto",
        "margin-right": "8px",
      }}
    >
      !
    </div>
  );
}

function Item(props: {
  path: string;
  icon: string;
  label: string;
  onClick?: () => void;
  children?: JSXElement;
}) {
  const href = () => {
    return "/app/settings/" + props.path;
  };
  const selected = useMatch(() => href() + "/*");

  return (
    <A href={href()} style={{ "text-decoration": "none" }}>
      <SettingItemContainer selected={selected()}>
        <Icon name={props.icon} size={18} />
        <div class="label">{props.label}</div>
        {props.children}
      </SettingItemContainer>
    </A>
  );
}

interface FooterItemProps {
  href?: string;
  external?: boolean;
  icon: string;
  label: string;
  subLabel?: string;
  onClick?: () => void;
  color?: string;
}

function FooterItem(props: FooterItemProps) {
  const Content = () => (
    <>
      <SettingItemContainer>
        <Icon name={props.icon} color={props.color} size={18} />
        <Text
          class={css`
            margin-right: auto;
          `}
          size={14}
        >
          {props.label}
        </Text>
        <Text
          size={14}
          color="rgba(255,255,255,0.4)"
          class={css`
            margin-right: 5px;
          `}
        >
          {props.subLabel}
        </Text>
        <Show when={props.external}>
          <Icon
            class={css`
              margin-right: 5px;
            `}
            color="rgba(255,255,255,0.6)"
            name="launch"
            size={16}
          />
        </Show>
      </SettingItemContainer>
    </>
  );
  return (
    <Switch>
      <Match when={props.href}>
        <A
          href={props.href!}
          target="_blank"
          rel="noopener noreferrer"
          style={{ "text-decoration": "none" }}
          children={Content}
        />
      </Match>
      <Match when={!props.href}>
        <div children={Content} onClick={props.onClick} />
      </Match>
    </Switch>
  );
}
