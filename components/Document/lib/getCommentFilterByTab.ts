const getCommentFilterByTab = (
  tabName: string
):
  | "BOUNTY"
  | "REVIEW"
  | "DISCUSSION"
  | "REPLICABILITY_COMMENT"
  | "PROPOSAL"
  | null
  | undefined => {
  switch (tabName) {
    case "bounties":
      return "BOUNTY";
    case "proposals":
      return "PROPOSAL";
    case "reviews":
      return "REVIEW";
    case "conversation":
      return "DISCUSSION";
    case "replicability":
      return "REPLICABILITY_COMMENT";
    default:
      return null;
  }
};

export default getCommentFilterByTab;
