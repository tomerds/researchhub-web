import React, { ReactElement, useMemo } from "react";
import { Fundraise, isFundraiseFulfilled } from "./lib/types";
import { css, StyleSheet } from "aphrodite";
import colors from "~/config/themes/colors";
import { timeTo } from "~/config/utils/dates";
import CommentAvatars from "../Comment/CommentAvatars";
import ResearchCoinIcon from "../Icons/ResearchCoinIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/pro-solid-svg-icons";
import { faClock } from "@fortawesome/pro-regular-svg-icons";
import FundraiseContributorsModal from "./ContributorsModal";
import Button from "../Form/Button";
import FundraiseContributeModal from "./ContributeModal";
import PermissionNotificationWrapper from "../PermissionNotificationWrapper";
import ContentBadge from "../ContentBadge";
import Bounty, {
  BOUNTY_STATUS,
  formatBountyAmount,
} from "~/config/types/bounty";
import { breakpoints } from "~/config/themes/screen";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { DocumentMetadata } from "../Document/lib/types";

export type GrantFundsCardProps = {
  amount: number;
  status: BOUNTY_STATUS;
  published: string;
  bountiesTotal: number;
  metadata: DocumentMetadata;
};

const GrantFundsCard = ({
  amount,
  metadata,
  status,
  published,
  bountiesTotal,
}: GrantFundsCardProps): ReactElement => {
  const openBountyAmount = (metadata?.bounties || []).reduce(
    (total, bounty) => bounty.amount + total,
    0
  );

  const grantorBounty = metadata.bounties[0].amount; // don't know if this is correct but assuming they are ordered by creation data, could check on id or createdBy

  const barFillAmount = useMemo(
    () => Math.min((grantorBounty / openBountyAmount) * 100, 100),
    [amount, bountiesTotal]
  );

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.header)}>
        <div className={css(styles.funderWrapper)}>
          <div className={css(styles.amountRaised)}>
            <ResearchCoinIcon
              overrideStyle={styles.rscIcon}
              color={colors.ORANGE_LIGHT2()}
              version={4}
              width={18}
              height={18}
            />
            <div className={css(styles.amountRaisedText)}>
              {formatBountyAmount({
                amount: grantorBounty,
                withPrecision: false,
              })}{" "}
              RSC
            </div>
            <div className={css(styles.goalText)}>from grantor</div>
          </div>
          <div className={css(styles.amountRaised)}>
            <ResearchCoinIcon
              overrideStyle={styles.rscIcon}
              color={colors.NEW_BLUE()}
              version={4}
              width={18}
              height={18}
            />
            <div className={css(styles.amountRaisedCommunityText)}>
              {formatBountyAmount({
                amount: openBountyAmount - grantorBounty,
                withPrecision: false,
              })}{" "}
              RSC
            </div>
            <div className={css(styles.goalText)}>from community</div>
          </div>
        </div>
      </div>
      {/* <div className={css(styles.footer)} onClick={(e) => e.stopPropagation()}>
        <FundraiseContributorsModal
          fundraiseId={f.id}
          totalContributors={f.contributors.total}
          triggerComponent={
            <div className={css(styles.supporters)}>
              <CommentAvatars
                people={f.contributors.top}
                spacing={f.contributors.total > 0 ? -20 : 0}
                withTooltip={false}
                showTotal={true}
                totalPeople={f.contributors.total}
                totalNoun="Supporter"
              />
            </div>
          }
        /> */}
      <div className={css(styles.barContainer)}>
        <div
          style={{
            width: `${barFillAmount}%`,
          }}
          className={css(
            styles.bar,
            status === BOUNTY_STATUS.CLOSED && styles.barCancelled
          )}
        />
      </div>
      <div className={css(styles.statusWrapper)}>
        {status === BOUNTY_STATUS.OPEN && (
          <div className={css(styles.timeLeft)}>
            <FontAwesomeIcon
              style={{ fontSize: 14, marginRight: 5 }}
              icon={faClock}
            />
            {timeTo(dayjs(published).add(30, "day"))} to go
          </div>
        )}
        {status === BOUNTY_STATUS.CLOSED ||
          (status === BOUNTY_STATUS.EXPIRED && (
            <div className={css(styles.fundraiseCompletedDetail)}>
              <FontAwesomeIcon
                style={{ fontSize: 14, marginRight: 5 }}
                icon={faCircleCheck}
              />
              Grant Completed
            </div>
          ))}
      </div>
      <div className={css(styles.buttonWrapper)}>
        <Button
          // isLink={{ href: `/post/${postId}/${postSlug}` }}
          size="small"
          type="primary"
          customButtonStyle={styles.customButtonStyle}
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "calc(100% - 32px)",
    borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY_BACKGROUND(),
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: 12,
      marginBottom: 12,
    },
  },

  amountRaised: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
  },
  funderWrapper: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rscIcon: {
    marginRight: 6,
    transform: "translateY(2.5px)",
  },
  amountRaisedCommunityText: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.NEW_BLUE(),
    whiteSpace: "nowrap",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      fontSize: 16,
    },
  },
  amountRaisedText: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.ORANGE_LIGHT2(),
    whiteSpace: "nowrap",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      fontSize: 16,
    },
  },
  amountRaisedTextFulfilled: {
    color: colors.NEW_GREEN(),
  },
  goalText: {
    fontSize: 16,
    fontWeight: 400,
    color: colors.MEDIUM_GREY(),
    marginLeft: 5,
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    whiteSpace: "nowrap",
  },
  timeLeft: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.MEDIUM_GREY2(),
    whiteSpace: "nowrap",
  },
  statusWrapper: {
    width: "100%",
    marginTop: "10px",
    display: "flex",
    justifyContent: "flex-end",
  },
  fundraiseCompletedDetail: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.NEW_GREEN(),
    whiteSpace: "nowrap",
  },

  barContainer: {
    width: "100%",
    borderRadius: 4,
    height: 8,
    backgroundColor: colors.NEW_BLUE(),
  },
  bar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.ORANGE_LIGHT2(),
  },
  barFulfilled: {
    backgroundColor: colors.NEW_GREEN(),
  },
  barCancelled: {
    backgroundColor: colors.GREY(),
  },

  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  supporters: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    color: colors.MEDIUM_GREY2(),
    ":hover": {
      cursor: "pointer",
    },
  },
  buttonWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "10px",
  },
  customButtonStyle: {
    color: colors.WHITE(),
    border: "none",
    minWidth: 100,
    backgroundColor: colors.ORANGE_LIGHT2(),
    ":hover": {
      backgroundColor: colors.ORANGE_LIGHT2(0.8),
    },
  },
});

export default GrantFundsCard;
