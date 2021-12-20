import { breakpoints } from "~/config/themes/screen";
import { css, StyleSheet } from "aphrodite";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty, nullthrows } from "~/config/utils/nullchecks";
import { ReactElement, ReactNode } from "react";
import AuthorFacePile from "../shared/AuthorFacePile";
import colors, { genericCardColors } from "~/config/themes/colors";
import Image from "next/image";

type Props = {
  hub: any;
  hubSubscribeButton?: ReactNode | null;
  isHomePage: Boolean;
  mainHeaderText: string;
};

export default function FeedInfoCard({
  hub,
  hubSubscribeButton,
  isHomePage,
  mainHeaderText,
}: Props): ReactElement<"div"> | null {
  if (isHomePage || isEmpty(hub)) {
    return <h1 className={css(styles.title) + " clamp2"}>{mainHeaderText}</h1>;
  }

  const {
    description,
    editor_permission_groups = [],
    hub_image: hubImage,
    subscriber_count: subCount,
  } = hub;
  const editorProfiles = editor_permission_groups.map(
    (editor_group: any): any => editor_group?.user?.author_profile
  );
  return (
    <div className={css(styles.feedInfoCard)}>
      <Image
        height={64}
        layout="fixed"
        objectFit="cover"
        src={hubImage ?? "/static/background/hub-placeholder.svg"}
        width={68}
      />
      <div className={css(styles.bodyContainer)}>
        <div className={css(styles.titleContainer)}>
          <h1 className={css(styles.title) + " clamp2"}>{mainHeaderText}</h1>
          <div className={css(styles.subscribeContainer)}>
            {nullthrows(hubSubscribeButton)}
          </div>
        </div>
        <div className={css(styles.detailRow)}>
          <div className={css(styles.detailRowLabel)}>
            <FontAwesomeIcon icon={faUser} style={{ width: "16px" }} />
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>{"Users "}</span>
            <span style={{ color: colors.TEXT_GREY(1) }}>{subCount}</span>
          </div>
        </div>
        {!isEmpty(editorProfiles) && (
          <div className={css(styles.detailRow)}>
            <div className={css(styles.detailRowLabel)}>
              <Image
                height={16}
                src="/static/background/editor-star.svg"
                width={16}
              />
            </div>
            <div className={css(styles.editorsWrap)}>
              <span style={{ fontWeight: 500, marginRight: 8 }}>{`Editor${
                editorProfiles.length > 1 ? "s" : ""
              } `}</span>
              {!isEmpty(editorProfiles) ? (
                <AuthorFacePile
                  authorProfiles={editorProfiles}
                  imgSize={16}
                  horizontal
                  withAuthorName
                />
              ) : (
                <span style={{ color: colors.TEXT_GREY(1) }}>{"N/A"}</span>
              )}
            </div>
          </div>
        )}
        <div className={css(styles.detailRow)}>
          <div>{isEmpty(description) ? null : description}</div>
        </div>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  feedInfoCard: {
    backgroundColor: "#fff",
    border: `1px solid ${genericCardColors.BORDER}`,
    borderRadius: 4,
    display: "flex",
    padding: 16,
  },
  bodyContainer: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 16,
    width: "100%",
  },
  detailRow: {
    display: "flex",
    fontSize: 16,
    margin: "8px 0",
  },
  detailRowLabel: {
    color: colors.LIGHT_GREY_TEXT,
    marginRight: 8,
    width: 20,
  },
  subscribeContainer: {
    marginLeft: 16,
    minWidth: 100,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      display: "none",
    },
  },
  title: {
    color: colors.TEXT_DARKER_GREY,
    fontSize: 30,
    fontWeight: 400,
    margin: 0,
    padding: 0,
    textOverflow: "ellipsis",
    [`@media only screen and max-width: ${breakpoints.large.str}`]: {
      fontSize: 30,
    },
    [`@media only screen and max-width: ${breakpoints.small.str}`]: {
      display: "flex",
      fontSize: 25,
      justifyContent: "center",
      textAlign: "center",
      whiteSpace: "pre-wrap",
      wordBreak: "normal",
    },
    [`@media only screen and max-width: ${breakpoints.xxsmall.str}`]: {
      fontSize: 25,
    },
    [`@media only screen and max-width: ${breakpoints.xxxsmall.str}`]: {
      fontSize: 20,
    },
  },
  titleContainer: { display: "flex", width: "100%" },
  editorsWrap: { display: "flex" },
});
