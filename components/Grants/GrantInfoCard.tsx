import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { breakpoints } from "~/config/themes/screen";
import { css, StyleSheet } from "aphrodite";
import { ReactElement, ReactNode } from "react";
import { parseHub } from "~/config/types/hub";
import { PaperIcon } from "~/config/themes/icons";
import { faPenNib } from "@fortawesome/pro-solid-svg-icons";
import NewPostButton from "../NewPostButton";

type Props = {
  hub: any;
  hubSubscribeButton?: ReactNode | null;
  isHomePage: boolean;
  mainHeaderText: string;
};

export default function GrantInfoCard({
  hub,
  mainHeaderText,
}: Props): ReactElement<"div"> | null {
  const { description, editor_permission_groups = [] } = hub ?? {};

  const isUserHubEditor =
    hub.editor_permission_groups.length > 0 &&
    hub.editor_permission_groups
      .map((p) => {
        return p.content_type == 2 ? p.object_id : null;
      })
      .includes(hub.id);

  console.log(isUserHubEditor);

  const parsedHub = parseHub(hub);
  const numPapers = parsedHub.numDocs || 0;
  const numComments = parsedHub.numComments || 0;
  const formattedDescription = (description || "").replace(/\.$/, "");

  return (
    <div className={css(styles.feedInfoCard)}>
      <div className={css(styles.detailRow)}>
        <div className={css(styles.titleContainer)}>
          <h1 className={css(styles.title) + " clamp2"}>{mainHeaderText}</h1>
        </div>
        {isUserHubEditor ? (
          <div>
            <NewPostButton />
          </div>
        ) : null}
      </div>
      <div className={css(styles.bodyContainer)}>
        {formattedDescription?.length > 0 && (
          <div className={css(styles.description)}>{formattedDescription}.</div>
        )}
        <div className={css(styles.detailRow, styles.metadata)}>
          <div className={css(styles.dataPoint)}>
            {/* @ts-ignore */}
            <PaperIcon height={13} width={14} color="#918F9B" />
            <span>
              {numPapers === 1 ? `${numPapers} Grant` : `${numPapers} Grants`}
            </span>
          </div>
          <div className={css(styles.dataPoint)}>
            <FontAwesomeIcon
              icon={faPenNib}
              style={{ color: "#918F9B", fontSize: 12 }}
            />
            <span>
              {numComments === 1
                ? `${numComments} Application`
                : `${numComments} Applications`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  metadata: {
    display: "flex",
    alignItems: "center",
    columnGap: "25px",
    color: "#545161",
    marginTop: 15,
  },
  editors: {
    display: "flex",
    alignItems: "center",
    fontSize: 14,
    // columnGap: "25px",
    color: "#545161",
    marginTop: 15,
  },
  dataPoint: {
    fontSize: 14,
    fontWeight: 400,
    display: "flex",
    alignItems: "center",
    columnGap: "3px",
  },
  feedInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
    marginTop: 20,
  },
  hubImage: {
    borderRadius: 4,
    height: 68,
    width: 68,
    objectFit: "cover",
  },
  bodyContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  detailRow: {
    alignItems: "center",
    display: "flex",
    fontSize: 16,
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  detailRowLabel: {
    alignItems: "center",
    display: "flex",
    marginRight: 8,
  },
  description: {
    fontSize: 15,
    "::first-letter": {
      textTransform: "uppercase",
    },
  },
  subscribeContainer: {
    marginLeft: 20,
    minWidth: 100,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      minWidth: 70,
    },
  },
  title: {
    fontSize: 30,
    marginBottom: 0,
    fontWeight: 500,
    textOverflow: "ellipsis",
  },
  titleContainer: {
    alignItems: "center",
    display: "flex",
    width: "100%",
    flex: 1,
  },
  joinHubButtonStyle: {
    marginLeft: "auto",
    ":hover": {
      opacity: 1,
      // borderColor: "red",
      // color: "red",
    },
  },
  leaveButtonStyle: {
    ":hover": {
      opacity: 1,
      // borderColor: "red",
      // color: "red",
    },
  },
});
