import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { BackButton } from "../input/BackButton";
import { AvatarSettingsContent } from "./AvatarSettingsContent";
import { FormattedMessage } from "react-intl";
import { CloseButton } from "../input/CloseButton";
import { useRef } from "react";

export function AvatarSetupModal({ className, onBack, ...rest }) {
  const [showReadyme, setShowReadyme] = useState(false);
  const frame = useRef(null);

  const parse = event => {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      return null;
    }
  };
  const subscribe = event => {
    console.log(event);
    const json = parse(event);
    console.log(json);
    if (json?.source !== "readyplayerme") {
      return;
    }

    // Susbribe to all events sent from Ready Player Me once frame is ready
    if (json.eventName === "v1.frame.ready") {
      frame.current.contentWindow.postMessage(
        JSON.stringify({
          target: "readyplayerme",
          type: "subscribe",
          eventName: "v1.**"
        }),
        "*"
      );
    }

    // Get avatar GLB URL
    if (json.eventName === "v1.avatar.exported") {
      console.log(`Avatar URL=-=-=-=-=-=-=-=-=-=-=-=-: ${json.data.url}`);
    }

    // Get user id
    if (json.eventName === "v1.user.set") {
      console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
    }
  };
  useEffect(() => {
    if (showReadyme) {
      window.addEventListener("message", subscribe);
      document.addEventListener("message", subscribe);
    } else {
      window.removeEventListener("message", subscribe);
      document.removeEventListener("message", subscribe);
    }
  }, [showReadyme]);

  return !showReadyme ? (
    <Modal
      title={<FormattedMessage id="avatar-setup-sidebar.title" defaultMessage="Avatar Setup" />}
      beforeTitle={<BackButton onClick={onBack} />}
      className={className}
    >
      <AvatarSettingsContent {...rest} onCreateAvatar={() => setShowReadyme(true)} />
    </Modal>
  ) : (
    <Modal
      title={"Ready Player Me"}
      className={className}
      afterTitle={<CloseButton onClick={() => setShowReadyme(false)} />}
      disableFullscreen="false"
    >
      <iframe
        src="https://aaseyaverse.readyplayer.me/avatar?frameApi`"
        frameBorder="0"
        width={"100%"}
        height={600}
        allow={"camera *; microphone *; clipboard-write"}
        ref={frame}
      />
    </Modal>
  );
}

AvatarSetupModal.propTypes = {
  className: PropTypes.string,
  onBack: PropTypes.func
};
