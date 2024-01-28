import { NextPage } from "next";

const DocumentPageWithNoSlug: NextPage = ({}) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "20%",
        justifyContent: "center",
        fontSize: 22,
      }}
    >
      Loading...
    </div>
  );
};

export default DocumentPageWithNoSlug;
