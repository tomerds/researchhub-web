import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import sharedGetStaticProps from "~/components/Document/lib/sharedGetStaticProps";

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

export const getStaticProps: GetStaticProps = async (ctx) => {
  return sharedGetStaticProps({ ctx, documentType: "grant" });
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export default DocumentPageWithNoSlug;
