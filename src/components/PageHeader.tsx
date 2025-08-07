import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { css, styled } from "solid-styled-components";
import { A } from "solid-navigator";
import env from "@/common/env";
import { getUserDetailsRequest } from "@/chat-api/services/UserService";
import { RawUser } from "@/chat-api/RawData";
import { getStorageString, StorageKeys } from "@/common/localStorage";
import Icon from "./ui/icon/Icon";
import { appLogoUrl } from "@/common/worldEvents";
import { useTransContext } from "@mbarzda/solid-i18next";
import { logout } from "@/common/logout";
import { Skeleton } from "./ui/skeleton/Skeleton";
import Avatar from "./ui/Avatar";
import { Portal } from "solid-js/web";

const HeaderContainer = styled("header")`
  display: flex;
  height: 69px;
  flex-shrink: 0;
  background-color: var(--pane-color);
  border: solid 1px rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 100%;
  align-self: center;
  box-sizing: border-box;

  @media (max-width: 820px) {
    margin-left: 10px;
    margin-right: 10px;
    width: calc(100% - 20px);
  }
`;

const DesktopNav = styled("div")`
  display: none;
  @media (min-width: 821px) {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
    margin-right: 4px;
  }
`;

const MobileNavContainer = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
`;

const MobileNavContent = styled("div")`
  background-color: var(--pane-color);
  width: 80%;
  max-width: 300px;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HamburgerButton = styled("button")`
  display: none;
  @media (max-width: 820px) {
    display: block;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    margin-left: auto;
    margin-right: 20px;
  }
`;

const titleContainerStyle = css`
  display: flex;
  align-items: center;
  font-size: 20px;
  align-self: center;
  height: 50px;
  padding-left: 6px;
  padding-right: 6px;
  margin-left: 3px;
  color: white;
  text-decoration: none;
  transition: 0.2s;
  border-radius: 8px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Title = styled("div")`
  margin-left: 10px;
  padding-right: 4px;
  @media (max-width: 500px) {
    display: none;
  }
`;

const Logo = styled("img")`
  width: auto;
  height: 100%;
  padding-top: 1em;
  padding-bottom: 1.5em;
  filter: invert(1);
`;

const NavigationContainer = styled("nav")`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  margin-right: 4px;

  .register-button div {
    background: #4c93ff;
    background: linear-gradient(to right, #4c93ff 0%, #6a5dff 100%);
  }

  @media (max-width: 820px) {
    display: none;
  }
`;

const LinkContainer = styled("div")<{ primary: boolean }>`
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: 0.2s;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  height: 50px;
  padding-left: 10px;
  padding-right: 15px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  && {
    ${(props) =>
      props.primary
        ? `
        background-color: var(--primary-color);
        opacity: 0.9;
        transition: 0.2s;
        &:hover {
          opacity: 1;
        }
      `
        : undefined}
  }
`;

const linkIconStyle = css`
  margin-right: 5px;
`;

export default function PageHeader(props: { hideAccountInfo?: boolean }) {
  const [user, setUser] = createSignal<null | false | RawUser>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  onMount(async () => {
    if (props.hideAccountInfo) {
      return;
    }
    if (!getStorageString(StorageKeys.USER_TOKEN, null)) {
      return setUser(false);
    }
    setTimeout(() => {
      loadUserDetails();
    }, 1000);
  });

  const loadUserDetails = async () => {
    const details = await getUserDetailsRequest().catch((err) => {
      if (err.code === 0) {
        setTimeout(() => {
          loadUserDetails();
        }, 5000);
        return "retrying";
      }
    });
    if (details === "retrying") {
      return;
    }
    if (!details) {
      return setUser(false);
    }
    setUser(details.user);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen());
  };

  return (
    <HeaderContainer class="header-container">
      <A href="/" class={titleContainerStyle}>
        <Logo src={appLogoUrl()} alt="logo" />
        {/* <Title>Nerimity</Title> */}
      </A>
      <Show when={!props.hideAccountInfo}>
        <DesktopNav>
          <Switch fallback={<LogInLogOutSkeleton />}>
            <Match when={user() === false}>
              <LoggedOutLinks />
            </Match>
            <Match when={user()}>
              <LoggedInLinks user={user() as RawUser} />
            </Match>
          </Switch>
        </DesktopNav>
        <HamburgerButton onClick={toggleMobileMenu}>
          <Icon name="menu" />
        </HamburgerButton>
        <Show when={isMobileMenuOpen()}>
          <MobileNav
            user={user()}
            onClose={() => setMobileMenuOpen(false)}
          />
        </Show>
      </Show>
    </HeaderContainer>
  );
}

function LogInLogOutSkeleton() {
  return (
    <NavigationContainer class="navigation-container">
      <Skeleton.Item width="106px" height="50px" />
      <Skeleton.Item width="130px" height="50px" />
      <Skeleton.Item
        width="38px"
        height="38px"
        style={{
          "border-radius": "50%",
          "margin-left": "6px",
          "margin-right": "6px",
        }}
      />
    </NavigationContainer>
  );
}

function LoggedInLinks(props: { user: RawUser }) {
  const [t] = useTransContext();
  const onLogoutClick = () => {
    logout();
  };

  return (
    <>
      <HeaderLink
        href="#"
        color="var(--alert-color)"
        onClick={onLogoutClick}
        label={t("header.logoutButton")}
        icon="logout"
      />
      <HeaderLink
        href="/app"
        label={t("header.openAppButton")}
        primary={true}
        icon="open_in_browser"
      />
      <Avatar
        size={38}
        user={props.user}
        class={css`
          margin-left: 6px;
          margin-right: 6px;
        `}
      />
    </>
  );
}

function LoggedOutLinks() {
  const [t] = useTransContext();
  return (
    <>
      <HeaderLink href="/login" label={t("header.loginButton")} icon="login" />
      <HeaderLink
        href="/register"
        label={t("header.joinNowButton")}
        class="register-button"
        icon="add"
      />
    </>
  );
}

function MobileNav(props: {
  user: RawUser | null | false;
  onClose: () => void;
}) {
  return (
    <Portal>
      <MobileNavContainer onClick={props.onClose}>
        <MobileNavContent onClick={(e) => e.stopPropagation()}>
          <Switch>
            <Match when={props.user === false}>
              <LoggedOutLinks />
            </Match>
            <Match when={props.user}>
              <LoggedInLinks user={props.user as RawUser} />
            </Match>
          </Switch>
        </MobileNavContent>
      </MobileNavContainer>
    </Portal>
  );
}

function HeaderLink(props: {
  icon?: string;
  href: string;
  label: string;
  class?: string;
  color?: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={props.href}
      onClick={props.onClick}
      style={{ "text-decoration": "none" }}
      class={props.class}
    >
      <LinkContainer
        primary={props.primary || false}
        style={{ color: props.color }}
      >
        <Show when={props.icon}>
          <Icon name={props.icon} color={props.color} class={linkIconStyle} />
        </Show>
        {props.label}
      </LinkContainer>
    </a>
  );
}
