import { toTitleCase } from "~/config/utils/string";
import Error from "next/error";
import fetchHubFromSlug from "~/pages/hubs/api/fetchHubFromSlug";
import Head from "~/components/Head";
import GrantPage from "~/components/Grants/GrantPage";

function Index({ slug, hub, error }) {
  if (error) {
    return <Error statusCode={error.code} />;
  }

  return (
    <div>
      <Head
        title={
          hub
            ? toTitleCase(hub.name) + " on ResearchHub"
            : toTitleCase(slug) + " on ResearchHub"
        }
        description={
          hub
            ? "Discuss and Discover " + toTitleCase(hub.name)
            : "Discuss and Discover " + toTitleCase(slug)
        }
      />
      <GrantPage hub={hub} slug={slug} />
    </div>
  );
}

export async function getStaticPaths(ctx) {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps(ctx) {
  let hub;

  try {
    hub = await fetchHubFromSlug({ slug: ctx.params.slug });
  } catch (err) {
    console.log("err", err);
    return {
      props: {
        error: {
          code: 500,
        },
      },
      revalidate: 5,
    };
  }

  if (!hub) {
    return {
      props: {
        error: {
          code: 404,
        },
      },
      revalidate: 5,
    };
  }

  return {
    props: {
      hub,
      slug: ctx.params.slug,
      isLiveFeed: false,
    },
    revalidate: 60 * 10,
  };
}

export default Index;
