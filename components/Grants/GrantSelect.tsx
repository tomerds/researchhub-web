import { getHubs } from "~/components/Hubs/api/fetchHubs";
import { Hub, parseHub } from "~/config/types/hub";
import { StyleSheet, css } from "aphrodite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faSearch } from "@fortawesome/pro-light-svg-icons";
import Menu, { MenuOption } from "~/components/shared/GenericMenu";
import { useEffect, useRef, useState } from "react";
import { fetchHubSuggestions } from "~/components/SearchSuggestion/lib/api";
import debounce from "lodash/debounce";
import { breakpoints } from "~/config/themes/screen";
import { HubSuggestion } from "~/components/SearchSuggestion/lib/types";
import EditHubModal from "~/components/Modals/EditHubModal";
import Pagination from "~/components/shared/Pagination";
import { getIsOnMobileScreenSize } from "~/config/utils/getIsOnMobileScreenSize";
import { useRouter } from "next/router";
import ReactPlaceholder from "react-placeholder/lib";
import { RectShape } from "react-placeholder/lib/placeholders";
import GrantCard from "./GrantCard";

type GrantSelectProps = {
  grants: any[];
  errorCode?: number;
  count: number;
  handleClick?: (event) => void;
  withPagination?: boolean;
  maxCardsPerRow?: number;
  selectedGrant?: Hub;
  canEdit?: boolean;
  preventLinkClick?: boolean;
};

const GrantSelect = ({
  grants,
  handleClick,
  count,
  withPagination = true,
  maxCardsPerRow,
  selectedGrant,
  canEdit,
  preventLinkClick = false,
}: GrantSelectProps) => {
  const router = useRouter();
  const sortOpts = [
    { label: "Popular", value: "-paper_count,-discussion_count,id" },
    { label: "Name", value: "name" },
  ];

  const [parsedGrants, setParsedGrants] = useState<Hub[]>(
    grants.map((grant) => parseHub(grant))
  );
  const [sort, setSort] = useState<MenuOption>(sortOpts[0]);
  const [page, setPage] = useState<number>(1);
  const prevSortValue = useRef(sort);
  const [suggestions, setSuggestions] = useState<HubSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [noSuggestionsFound, setNoSuggestionsFound] = useState(false);
  const cardWidth =
    maxCardsPerRow && maxCardsPerRow > 0
      ? `calc(${100 / maxCardsPerRow}% - 15px)`
      : "auto";

  const setQueryParam = ({ param, value }) => {
    // Destructure the current pathname and query
    const { pathname, query } = router;

    // Update the specific query parameter you want
    query[param] = value;

    // Push the new URL to the router
    router.push({
      pathname: pathname,
      query: query,
    });
  };

  const setPageGrants = async (page) => {
    setLoading(true);
    setQueryParam({ param: "page", value: page });
    // @ts-ignore
    const { grants } = await getHubs({
      page,
      ordering: sort.value,
    });
    const parsedGrants = grants.map((grant) => parseHub(grant));
    setLoading(false);
    setParsedGrants(parsedGrants);
  };

  function getQueryParam(name, url = window.location.href) {
    const params = new URL(url).searchParams;
    return params.get(name);
  }
  useEffect(() => {
    const pageParam = getQueryParam("page");
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      setPage(page);
      setPageGrants(page);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setNoSuggestionsFound(false);
      return;
    }

    setLoading(true);
    fetchHubSuggestions(query)
      .then((suggestions) => {
        // @ts-ignore
        setSuggestions(suggestions);
        setNoSuggestionsFound(suggestions.length === 0 ? true : false);
      })
      .catch((err) => {
        setNoSuggestionsFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  useEffect(() => {
    (async () => {
      const sortValueChanged = prevSortValue.current.value !== sort.value;
      if (sortValueChanged) {
        // @ts-ignore
        const { hubs: grants } = await getHubs({ ordering: sort.value });
        const parsedGrants = grants.map((grant) => parseHub(grant));
        setParsedGrants(parsedGrants);
        prevSortValue.current = sort;
      }
    })();
  }, [sort]);

  const debouncedSetQuery = debounce(setQuery, 500);
  let grantsToRender =
    query.length > 0 ? suggestions.map((s) => s.hub) : parsedGrants;

  if (selectedGrant && !query.length) {
    grantsToRender.unshift(selectedGrant);

    // remove duplicates
    const seen = new Set();
    grantsToRender = grantsToRender.filter((el) => {
      const duplicate = seen.has(el.id);
      seen.add(el.id);
      return !duplicate;
    });
  }

  const isMobileScreen = getIsOnMobileScreenSize();

  const editGrant = (newGrant) => {
    const newParsedGrant = parseHub(newGrant);
    const newGrants = parsedGrants.map((grant) => {
      if (newParsedGrant.id === grant.id) {
        return newParsedGrant;
      } else {
        return grant;
      }
    });

    setParsedGrants(newGrants);
  };

  return (
    <div className={css(styles.container)}>
      <EditHubModal editHub={editGrant} />
      <div className={css(styles.searchAndFilters)}>
        <div className={css(styles.search)}>
          <FontAwesomeIcon
            style={{ color: "#7C7989" }}
            icon={faSearch}
          ></FontAwesomeIcon>
          <input
            className={css(styles.input)}
            type="text"
            // value={query}
            onChange={(e) => {
              debouncedSetQuery(e.target.value);
            }}
            placeholder="Search grants"
          />
        </div>
        <Menu
          options={sortOpts}
          id="hub-sort"
          selected={sort.value}
          direction="bottom-right"
          onSelect={(option) => {
            setSort(option);
            setQueryParam({ param: "page", value: 1 });
            setPage(1);
          }}
        >
          <div className={css(styles.sortTrigger)}>
            {sort.label}
            <FontAwesomeIcon
              icon={faAngleDown}
              style={{ marginLeft: 3, fontSize: 16 }}
            />
          </div>
        </Menu>
      </div>
      <div className={css(styles.cardsWrapper)}>
        {/* @ts-ignore */}
        <ReactPlaceholder
          ready={!loading}
          customPlaceholder={
            <GrantsPlaceholder maxCardsPerRow={maxCardsPerRow} />
          }
        >
          {grantsToRender.map((h) => (
            <div
              className={css(!maxCardsPerRow && styles.hubCardWrapper)}
              style={{ width: cardWidth }}
              key={h.id}
            >
              <GrantCard
                isSelected={h.id === selectedGrant?.id}
                descriptionStyle={styles.hubCardDescription}
                grant={h}
                handleClick={handleClick}
                canEdit={canEdit}
                preventLinkClick={preventLinkClick}
              />
            </div>
          ))}
        </ReactPlaceholder>
        {noSuggestionsFound && <div>No hubs found.</div>}
      </div>
      {/*
        Only show the Pagination component if user isn't searching.
        We only show the first 25 search results (as of now), so pagination is not needed.
        -> Permalink to 25 limit: https://github.com/ResearchHub/researchhub-backend/blob/e214e56b51ca707ae2d748830e298410f385b299/src/search/views/hub_suggester.py#L41
        */}
      {withPagination && query.length <= 0 && (
        <div className={css(styles.pagination)}>
          <Pagination
            count={Math.ceil(count / 40)}
            variant="outlined"
            shape="rounded"
            color="primary"
            page={page}
            // limiting boundary and sibling count reduces width of entire component,
            // which is useful to prevent overflow/wrappping on mobile.
            boundaryCount={isMobileScreen ? 1 : undefined}
            siblingCount={isMobileScreen ? 0 : undefined}
            onChange={(event, page) => {
              const fetchHubs = async () => {
                window.scrollTo({ top: 0 });
                setPageGrants(page);
                setPage(page);
                // scroll to top
              };
              fetchHubs();
            }}
          />
        </div>
      )}
    </div>
  );
};

const GrantsPlaceholder = ({ maxCardsPerRow }) => {
  const cardWidth =
    maxCardsPerRow && maxCardsPerRow > 0
      ? `calc(${100 / maxCardsPerRow}% - 15px)`
      : "100%";

  const numPlaceholder = new Array(12).fill(null);
  return (
    <div
      className={"show-loading-animation" + " " + css(styles.grantsPlaceholder)}
    >
      {numPlaceholder.map((_, index) => {
        return (
          <RectShape
            color="#efefef"
            className={css(!maxCardsPerRow && styles.hubCardWrapper)}
            style={{ width: cardWidth, height: 220, marginRight: 0 }}
            key={index}
          />
        );
      })}
    </div>
  );
};

const styles = StyleSheet.create({
  container: {},
  hubCardWrapper: {
    width: "calc(25% - 15px)",
    [`@media only screen and (max-width: 1340px)`]: {
      width: "calc(33% - 15px)",
    },
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      width: "calc(50% - 15px)",
    },
  },
  grantsPlaceholder: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    width: "100%",
    // gridTemplateColumns: "1fr 1fr 1fr 1fr",
  },
  searchAndFilters: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createHubButton: {
    marginLeft: "auto",
  },
  pagination: {
    marginTop: 24,
    marginBottom: 24,
    display: "flex",
    justifyContent: "flex-end",
    // mobile
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      justifyContent: "center",
      width: "100%",
    },
  },
  createHubButtonContainer: {
    display: "flex",
    alignItems: "center",
  },
  hubCardDescription: {
    fontSize: 14,
    lineHeight: "18px",
  },
  sortTrigger: {
    display: "flex",
    columnGap: "4px",
    alignItems: "center",
    fontWeight: 500,
    padding: "8px 10px 8px 10px",
    fontSize: 14,
    border: `1px solid #E9EAEF`,
    borderRadius: 4,
  },
  search: {
    width: 400,
    boxSizing: "border-box",
    paddingLeft: "12px",
    paddingRight: "12px",
    border: `1px solid #E9EAEF`,
    display: "flex",
    borderRadius: 4,
    alignItems: "center",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      width: "70%",
    },
  },
  input: {
    border: 0,
    width: "100%",
    marginLeft: 10,
    height: 30,
    outline: "none",
    fontSize: 14,
  },
  cardsWrapper: {
    borderTop: `1px solid #E9EAEF`,
    paddingTop: 20,
    marginTop: 20,
    display: "flex",
    maxWidth: "100%",
    flexWrap: "wrap",
    columnGap: "20px",
    rowGap: "20px",
  },
});

export default GrantSelect;
