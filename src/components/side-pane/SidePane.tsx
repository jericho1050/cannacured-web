import style from "./styles.module.scss";
import { createEffect, createSignal, on, Show } from "solid-js";
import Icon from "@/components/ui/icon/Icon";
import Avatar from "@/components/ui/Avatar";
import RouterEndpoints from "../../common/RouterEndpoints";
import { classNames, cn } from "@/common/classNames";
import useStore from "../../chat-api/store/useStore";
import { A, useLocation, useMatch } from "solid-navigator";
import { FriendStatus } from "../../chat-api/RawData";
import LegacyModal from "@/components/ui/legacy-modal/LegacyModal";
import { userStatusDetail } from "../../common/userStatus";
import { useCustomPortal } from "../ui/custom-portal/CustomPortal";
import { hasBit, USER_BADGES } from "@/chat-api/Bitwise";
import { updateTitleAlert } from "@/common/BrowserTitle";
import { ConnectionErrorModal } from "../connection-error-modal/ConnectionErrorModal";
import { useAppVersion } from "@/common/useAppVersion";
import { useWindowProperties } from "@/common/useWindowProperties";
import { FlexColumn, FlexRow } from "../ui/Flexbox";
import Button from "../ui/Button";
import Text from "../ui/Text";
import Marked from "@/components/marked/Marked";
import { formatTimestamp } from "@/common/date";

import { Tooltip } from "../ui/Tooltip";
import { AddServerModal } from "./add-server-modal/AddServerModal";
import env from "@/common/env";
import { ProfileFlyout } from "../floating-profile/FloatingProfile";
import { StorageKeys } from "@/common/localStorage";
import { useResizeBar } from "../ui/ResizeBar";
import { NotificationCountBadge } from "./NotificationCountBadge";
import { SidebarItemContainer } from "./SidebarItemContainer";
import { ServerList } from "./ServerList";

export default function SidePane(props: { class?: string }) {
  let containerEl: HTMLDivElement | undefined;
  const { createPortal } = useCustomPortal();
  const { isMobileWidth } = useWindowProperties();
  const { account } = useStore();

  const showAddServerModal = () => {
    createPortal?.((close) => <AddServerModal close={close} />);
  };

  const resizeBar = useResizeBar({
    storageKey: StorageKeys.SIDEBAR_WIDTH,
    defaultWidth: 65,
    minWidth: 40,
    maxWidth: 65,
    element: () => containerEl,
  });

  return (
    <div
      ref={containerEl}
      class={cn(
        style.sidePane,
        isMobileWidth() ? style.mobile : undefined,
        props.class
      )}
      style={
        isMobileWidth()
          ? { width: "65px" }
          : { width: `${resizeBar.width()}px` }
      }
    >
      <Show when={!isMobileWidth()}>
        <HomeItem size={resizeBar.width()} />
      </Show>
      <div class={style.scrollable}>
        <ServerList size={resizeBar.width()} />
        {/* Admin-only Add Server button */}
        <Show when={account.hasModeratorPerm()}>
          <Tooltip tooltip="Add Server">
            <SidebarItemContainer onClick={showAddServerModal}>
              <Icon
                name="add_box"
                size={resizeBar.width() - resizeBar.width() * 0.378}
              />
            </SidebarItemContainer>
          </Tooltip>
        </Show>
      </div>
      <UpdateItem size={resizeBar.width()} />
      <Show when={!isMobileWidth()}>
        <ModerationItem size={resizeBar.width()} />
        <SettingsItem size={resizeBar.width()} />
        <UserItem size={resizeBar.width()} />
      </Show>
      <resizeBar.Handle />
    </div>
  );
}

function HomeItem(props: { size: number }) {
  const { inbox, friends, servers } = useStore();
  const location = useLocation();
  const isSelected = () => {
    if (location.pathname === "/app") return true;
    if (location.pathname.startsWith(RouterEndpoints.INBOX())) return true;
    if (location.pathname.startsWith("/app/posts")) return true;
    return false;
  };

  const notificationCount = () => inbox.notificationCount();
  const friendRequestCount = () =>
    friends.array().filter((friend) => friend.status === FriendStatus.PENDING)
      .length;

  const count = () => notificationCount() + friendRequestCount();

  createEffect(() => {
    updateTitleAlert(count() || servers.hasNotifications() ? true : false);
  });

  return (
    <Tooltip tooltip="Home">
      <A href="/app" style={{ "text-decoration": "none" }}>
        <SidebarItemContainer selected={isSelected()} alert={count()}>
          <NotificationCountBadge count={count()} top={10} right={10} />
          <Icon name="home" size={props.size - props.size * 0.6308} />
        </SidebarItemContainer>
      </A>
    </Tooltip>
  );
}

function UpdateItem(props: { size: number }) {
  const checkAfterMS = 600000; // 10 minutes
  const { checkForUpdate, updateAvailable } = useAppVersion();
  const { createPortal } = useCustomPortal();
  const { hasFocus } = useWindowProperties();
  let lastChecked = 0;

  createEffect(
    on(hasFocus, async () => {
      if (updateAvailable()) return;
      const now = Date.now();
      if (now - lastChecked >= checkAfterMS) {
        lastChecked = now;
        checkForUpdate();
      }
    })
  );

  const showUpdateModal = () =>
    createPortal?.((close) => <UpdateModal close={close} />);

  return (
    <Show when={updateAvailable()}>
      <Tooltip tooltip="Update Available">
        <SidebarItemContainer onclick={showUpdateModal}>
          <Icon
            name="get_app"
            color="var(--success-color)"
            size={props.size - props.size * 0.6308}
          />
        </SidebarItemContainer>
      </Tooltip>
    </Show>
  );
}
function ModerationItem(props: { size: number }) {
  const { account, tickets } = useStore();
  const hasModeratorPerm = () =>
    hasBit(account.user()?.badges || 0, USER_BADGES.FOUNDER.bit) ||
    hasBit(account.user()?.badges || 0, USER_BADGES.ADMIN.bit);

  const selected = useMatch(() => "/app/moderation/*");

  return (
    <Show when={hasModeratorPerm()}>
      <Tooltip tooltip="Moderation Pane">
        <A href="/app/moderation" style={{ "text-decoration": "none" }}>
          <SidebarItemContainer selected={selected()}>
            <Show when={tickets.hasModerationTicketNotification()}>
              <NotificationCountBadge count={"!"} top={5} right={10} />
            </Show>
            <Icon name="security" size={props.size - props.size * 0.6308} />
          </SidebarItemContainer>
        </A>
      </Tooltip>
    </Show>
  );
}

function SettingsItem(props: { size: number }) {
  const { tickets } = useStore();

  const selected = useMatch(() => "/app/settings/*");

  return (
    <Tooltip tooltip="Settings">
      <A href="/app/settings/account" style={{ "text-decoration": "none" }}>
        <SidebarItemContainer selected={selected()}>
          <Show when={tickets.hasTicketNotification()}>
            <NotificationCountBadge count={"!"} top={5} right={10} />
          </Show>
          <Icon name="settings" size={props.size - props.size * 0.6308} />
        </SidebarItemContainer>
      </A>
    </Tooltip>
  );
}

const UserItem = (props: { size: number }) => {
  const { account, users } = useStore();
  const { createPortal, isPortalOpened } = useCustomPortal();
  const [hovered, setHovered] = createSignal(false);

  const userId = () => account.user()?.id;
  const user = () => users.get(userId()!);
  const presenceColor = () =>
    user() && userStatusDetail(user()?.presence()?.status || 0).color;

  const isAuthenticated = account.isAuthenticated;
  const authErrorMessage = account.authenticationError;
  const isConnected = account.isConnected;

  const isAuthenticating = () => !isAuthenticated() && isConnected();
  const showConnecting = () =>
    !authErrorMessage() && !isAuthenticated() && !isAuthenticating();

  const modalOpened = () => {
    return isPortalOpened("profile-pane-flyout-" + userId());
  };
  const onClicked = (event: MouseEvent) => {
    if (authErrorMessage()) {
      return createPortal?.((close) => <ConnectionErrorModal close={close} />);
    }

    if (!user()) return;
    const el = event.target as HTMLElement;
    const rect = el?.getBoundingClientRect()!;
    const pos = {
      left: props.size + 6,
      top: rect.top + 10,
      bottom: 8,
      anchor: "left",
    } as const;
    return createPortal(
      (close) => (
        <ProfileFlyout
          hideLatestPost
          triggerEl={el}
          showProfileSettings
          position={pos}
          close={close}
          userId={userId()}
        />
      ),
      "profile-pane-flyout-" + userId(),
      true
    );
  };

  return (
    <>
      <Tooltip
        disable={modalOpened()}
        tooltip={
          <div>
            Profile{" "}
            <Show when={user()}>
              <div style={{ "line-height": "1" }}>
                {user()!.username}:{user()!.tag}
              </div>
            </Show>
          </div>
        }
      >
        <SidebarItemContainer
          class={classNames(
            style.user,
            "sidePaneUser",
            "trigger-profile-flyout"
          )}
          onclick={onClicked}
          selected={modalOpened()}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {account.user() && (
            <Avatar
              animate={hovered()}
              size={props.size - props.size * 0.4}
              user={account.user()!}
              resize={96}
            />
          )}
          {!showConnecting() && (
            <div
              class={style.presence}
              style={{ background: presenceColor() }}
            />
          )}
          {showConnecting() && (
            <Icon name="autorenew" class={style.connectingIcon} size={24} />
          )}
          {isAuthenticating() && (
            <Icon
              name="autorenew"
              class={classNames(style.connectingIcon, style.authenticatingIcon)}
              size={props.size - props.size * 0.6308}
            />
          )}
          {authErrorMessage() && (
            <Icon
              name="error"
              class={style.errorIcon}
              size={props.size - props.size * 0.6308}
            />
          )}
        </SidebarItemContainer>
      </Tooltip>
    </>
  );
};

function UpdateModal(props: { close: () => void }) {
  const { latestRelease } = useAppVersion();

  const isRelease = env.APP_VERSION?.startsWith("v");

  const date = () => {
    const release = latestRelease();
    if (!release) return undefined;
    return formatTimestamp(new Date(release.published_at).getTime());
  };

  const onUpdateClick = async () => {
    location.reload();
  };

  const ActionButtons = (
    <FlexRow style={{ "justify-content": "flex-end", flex: 1, margin: "5px" }}>
      <Button
        iconName="close"
        onClick={props.close}
        label="Later"
        color="var(--alert-color)"
      />
      <Button
        iconName="get_app"
        label="Update Now"
        onClick={onUpdateClick}
        primary
      />
    </FlexRow>
  );
  return (
    <LegacyModal
      title="Update Available"
      actionButtons={ActionButtons}
      close={props.close}
    >
      <FlexColumn gap={5}>
        <FlexColumn
          style={{
            "max-height": "400px",
            "max-width": "600px",
            overflow: "auto",
            padding: "10px",
          }}
        >
          <Show when={isRelease}>
            <Text size={24}>{latestRelease()?.name || ""}</Text>
            <Text opacity={0.7}>Released at {date() || ""}</Text>
            <Text opacity={0.7}>{latestRelease()?.tag_name}</Text>
            <Marked value={latestRelease()?.body!} />
          </Show>
        </FlexColumn>
      </FlexColumn>
    </LegacyModal>
  );
}
