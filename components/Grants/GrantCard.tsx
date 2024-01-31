import { Hub } from "~/config/types/hub";
import { StyleSheet, css } from "aphrodite";
import { PaperIcon } from "~/config/themes/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import colors from "~/config/themes/colors";
import Link from "next/link";
import { truncateText } from "~/config/utils/string";
import { formatNumber } from "~/config/utils/number";
import { faCheckCircle, faPenToSquare } from "@fortawesome/pro-light-svg-icons";
import { useEffect, useState } from "react";
import { ModalActions } from "~/redux/modals";
import { connect } from "react-redux";
import ResearchCoinIcon from "../Icons/ResearchCoinIcon";
import GrantTag from "./GrantTag";
import fetchUnifiedDocs from "../UnifiedDocFeed/api/unifiedDocFetch";

interface Props {
  grant: Hub;
  cardStyle?: any;
  descriptionStyle?: any;
  metadataStyle?: any;
  preventLinkClick?: boolean;
  isSelected?: boolean;
  numberCharactersToShow?: number;
  openEditHubModal: (boolean: boolean, grant) => void;
  canEdit?: boolean;
  handleClick?: (grant) => void;
}

const GrantCard = ({
  grant,
  cardStyle,
  descriptionStyle,
  handleClick,
  metadataStyle,
  preventLinkClick,
  canEdit,
  openEditHubModal,
  isSelected = false,
  numberCharactersToShow = 150,
}: Props) => {
  const description = truncateText(grant.description, numberCharactersToShow);

  const [numGrants, setNumGrants] = useState("0");
  const [numRSC, setNumRSC] = useState(0);
  // HAM 01/30/24: Temporary soluiton - I ~think~ this only gets number of
  // grants and RSC from first page of pagination not all of them on hub
  useEffect(() => {
    const parseGrantHubNumbers = async () => {
      fetchUnifiedDocs({
        selectedFilters: {
          isReady: true,
          sort: "hot",
          tags: [],
          time: "today",
          topLevel: "/",
          type: "all",
        },
        hubID: grant.id,
        isLoggedIn: true,
        onError: () => console.log("error"),
        onSuccess: ({ documents }): void => {
          setNumGrants(formatNumber(documents.length));
          setNumRSC(
            documents.reduce((accumulator, d) => {
              return (
                accumulator + parseInt(d.document_filter.bounty_total_amount)
              );
            }, 0)
          );
        },
      });
    };
    parseGrantHubNumbers();
  }, []);

  const [hoverEditIcon, setHoverEditIcon] = useState(false);
  const grantCardContent = (
    <>
      <GrantTag grant={grant} preventLinkClick={preventLinkClick} />
      <div className={css(styles.description, descriptionStyle)}>
        {description}
      </div>
      <div className={css(styles.metadata, metadataStyle)}>
        <div className={css(styles.dataPoint)}>
          {/* @ts-ignore */}
          <PaperIcon height={13} width={14} />
          <span>
            {numGrants === "1" ? `${numGrants} Grant` : `${numGrants} Grants`}
          </span>
        </div>
        {/* Change this to show total funded amount  */}
        <div className={css(styles.dataPoint)}>
          <ResearchCoinIcon height={15} width={15} />
          <span className={css(styles.rscText)}>{numRSC} RSC</span>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={css(styles.hubCard, cardStyle, isSelected && styles.selected)}
    >
      {isSelected && (
        <FontAwesomeIcon
          className={css(styles.selectedCheck)}
          icon={faCheckCircle}
        />
      )}
      {!!canEdit && (
        <div
          className={css(
            styles.editIcon,
            hoverEditIcon && styles.hoverEditIcon
          )}
          onClick={() => {
            openEditHubModal(true, grant);
          }}
          onMouseEnter={() => setHoverEditIcon(true)}
          onMouseLeave={() => setHoverEditIcon(false)}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </div>
      )}
      {handleClick ? (
        <div onClick={() => handleClick(grant)}>{grantCardContent}</div>
      ) : preventLinkClick ? (
        <div>{grantCardContent}</div>
      ) : (
        <Link href={`/grants/${grant.slug}`} style={{ textDecoration: "none" }}>
          {grantCardContent}
        </Link>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  hubCard: {
    border: "1px solid #E9EAEF",
    position: "relative",
    borderRadius: 4,
    width: `100%`,
    height: 220,
    padding: 15,
    fontSize: 16,
    boxSizing: "border-box",
    ":hover": {
      background: colors.LIGHTER_GREY(0.5),
      transition: "0.2s",
      cursor: "pointer",
    },
  },
  selected: {
    background: colors.NEW_BLUE(0.1),
    ":hover": {
      background: colors.NEW_BLUE(0.1),
    },
  },
  selectedCheck: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8,
    fontSize: 24,
    color: colors.NEW_BLUE(1),
  },
  description: {
    marginTop: 20,
    fontWeight: 400,
    fontSize: "1em",
    lineHeight: "22px",
    color: "#7C7989",
    height: 120,
    overflow: "hidden",
    // whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    "::first-letter": {
      textTransform: "uppercase",
    },
  },
  metadata: {
    borderTop: `1px solid ${colors.GREY_BORDER}`,
    width: "100%",
    height: 35,
    display: "flex",
    alignItems: "center",
    columnGap: "25px",
    color: "#545161",
  },
  dataPoint: {
    fontSize: "0.75em",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    columnGap: "5px",
  },
  hoverEditIcon: {
    background: colors.GREY_BORDER,
  },
  editIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 8,
    borderRadius: "0px 4px 0px 4px",
  },
  rscText: {
    color: "#F3A113",
  },
});

const mapDispatchToProps = {
  openEditHubModal: ModalActions.openEditHubModal,
};
export default connect(null, mapDispatchToProps)(GrantCard);
