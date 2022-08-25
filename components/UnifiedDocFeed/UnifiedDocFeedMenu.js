import { css, StyleSheet } from "aphrodite";
import { breakpoints } from "~/config/themes/screen";
import { useState, useEffect } from "react";
import DropdownButton from "~/components/Form/DropdownButton";
import colors, { pillNavColors } from "~/config/themes/colors";
import FeedOrderingDropdown from "./FeedOrderingDropdown";
import {
  feedTypeOpts,
  sortOpts,
  tagFilters,
  topLevelFilters,
} from "./constants/UnifiedDocFilters";
import icons from "~/config/themes/icons";
import { useRouter } from "next/router";
import AuthorAvatar from "../AuthorAvatar";
import { connect } from "react-redux";
import { getSelectedUrlFilters } from "./utils/getSelectedUrlFilters";
import MyHubsDropdown from "../Hubs/MyHubsDropdown";
import TagDropdown from "./TagDropdown";

const UnifiedDocFeedMenu = ({ currentUser }) => {
  const router = useRouter();

  const [isHubSelectOpen, setIsHubSelectOpen] = useState(false);
  const [isSmallScreenDropdownOpen, setIsSmallScreenDropdownOpen] =
    useState(false);

  const [tagsMenuOpenFor, setTagsMenuOpenFor] = useState(null);
  const selectedFilters = getSelectedUrlFilters({
    query: router.query,
    pathname: router.pathname,
  });

  useEffect(() => {
    const _handleOutsideClick = (e) => {
      const isTypeFilterClicked = e.target.closest(".typeFilter");
      if (!isTypeFilterClicked) {
        setTagsMenuOpenFor(null);
      }
    };

    document.addEventListener("click", _handleOutsideClick);

    return () => {
      document.removeEventListener("click", _handleOutsideClick);
    };
  }, []);

  const getTabs = ({ selectedFilters }) => {
    const _renderOption = (opt) => {
      return (
        <div className={css(styles.labelContainer)}>
          <span className={css(styles.iconWrapper)}>{opt.icon}</span>
          <span className={css(styles.optLabel)}>{opt.label}</span>
        </div>
      );
    };

    const tabs = Object.values(feedTypeOpts).map((opt) => ({
      html: _renderOption(opt),
      ...opt,
    }));

    let tabsAsHTML = tabs.map((tabObj) => {
      if (tabObj.value === selectedFilters.type) {
        tabObj.isSelected = true;
      }
      return tabObj;
    });

    return tabsAsHTML;
  };

  const _handleFilterSelect = ({ typeFilter, tags, sort, timeScope }) => {
    const query = { ...router.query };

    if (Array.isArray(tags)) {
      let newTags = [];
      if (Array.isArray(query.tags)) {
        newTags = [...query.tags];
      } else if (query.tags) {
        newTags.push(query.tags);
      }

      for (let i = 0; i < tags.length; i++) {
        const tagAlreadyInList = newTags.includes(tags[i]);
        if (tagAlreadyInList) {
          newTags = newTags.filter((t) => t !== tags[i]);
        } else {
          newTags.push(tags[i]);
        }
      }

      query.tags = newTags;
    }

    if (typeFilter) {
      const isDefault = Object.values(feedTypeOpts)[0].value == typeFilter;
      if (isDefault) {
        delete query.type;
      } else {
        query.type = typeFilter;
      }

      // Reset tags when switching type filters
      if (!tags || tags.length === 0) {
        delete query.tags;
      }
    }

    if (sort) {
      const isDefault = sortOpts[0].value == sort;
      if (isDefault) {
        delete query.sort;
        delete query.time;
      } else {
        query.sort = sort;
      }
    }

    if (timeScope) {
      query.time = timeScope;
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const renderTab = (tabObj, selectedFilters) => {
    const isSelected = tabObj.value === selectedFilters.type;
    const nestedOptions = tagFilters.filter((sub) =>
      sub.availableFor.includes(tabObj.value)
    );
    return (
      <div
        className={`${css(
          styles.tab,
          tabObj.isSelected && styles.tabSelected
        )} typeFilter`}
        onClick={() => {
          if (isSelected && nestedOptions.length > 0) {
            if (tagsMenuOpenFor) {
              setTagsMenuOpenFor(null);
            } else {
              setTagsMenuOpenFor(tabObj.value);
            }
          } else {
            _handleFilterSelect({ typeFilter: tabObj.value });
          }
        }}
      >
        <div className={css(styles.labelContainer)}>
          <span className={css(styles.tabText)}>{tabObj.label}</span>
          <span className={css(styles.downIcon)}>
            {tabObj.value === selectedFilters.type && icons.chevronDown}
          </span>
          {tagsMenuOpenFor === tabObj.value && (
            <TagDropdown
              options={nestedOptions}
              selectedTags={selectedFilters.tags}
              handleSelect={(selected) =>
                _handleFilterSelect({ tags: [selected] })
              }
            />
          )}
        </div>
      </div>
    );
  };

  const getSelectedTab = (tabs) => {
    let selectedTab = null;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].isSelected) {
        selectedTab = tabs[i];
        break;
      }
    }

    if (!selectedTab) {
      console.error("Selected tab not found. This should not happen.");
      selectedTab = tabs[0];
    }

    return selectedTab;
  };

  const tabs = getTabs({ selectedFilters });
  const selectedTab = getSelectedTab(tabs);

  return (
    <div className={css(styles.filtersContainer)}>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.mainFilters)}>
          <div className={css(topLevelFilterStyles.container)}>
            {topLevelFilters.map((f) => (
              <div
                className={css(
                  topLevelFilterStyles.filter,
                  f.value === selectedFilters.topLevel &&
                    topLevelFilterStyles.filterSelected
                )}
                onClick={() => {
                  if (
                    f.value === "my-hubs" &&
                    f.value === selectedFilters.topLevel
                  ) {
                    setIsHubSelectOpen(!isHubSelectOpen);
                  } else {
                    _handleTopLevelFilterSelect(f);
                  }
                }}
              >
                {f.value === "my-hubs" && isHubSelectOpen && <MyHubsDropdown />}
                <span className={css(topLevelFilterStyles.filterIcon)}>
                  {f.value === "my-hubs" && (
                    <AuthorAvatar
                      author={currentUser?.author_profile}
                      size={20}
                    />
                  )}
                  {f.icon}
                </span>
                <span className={css(topLevelFilterStyles.filterLabel)}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
          <div className={css(styles.feedMenu)}>
            <div className={css(styles.filtersAsTabs)}>
              <div className={css(styles.tab, styles.smallScreenFilters)}>
                <DropdownButton
                  labelAsHtml={
                    <div className={css(styles.labelContainer)}>
                      <span className={css(styles.iconWrapper)}>
                        {selectedTab.icon}
                      </span>
                      <span className={css(styles.tabText)}>
                        {selectedTab?.selectedLabel || selectedTab.label}
                      </span>
                    </div>
                  }
                  selected={selectedTab.value}
                  isOpen={isSmallScreenDropdownOpen}
                  opts={tabs}
                  onClick={() => setIsSmallScreenDropdownOpen(true)}
                  dropdownClassName="combinedDropdown"
                  onClickOutside={() => {
                    setIsSmallScreenDropdownOpen(false);
                  }}
                  overridePopoverStyle={styles.overridePopoverStyle}
                  positions={["bottom", "right"]}
                  customButtonClassName={[styles.smallScreenFiltersDropdown]}
                  overrideOptionsStyle={styles.moreDropdownOptions}
                  overrideDownIconStyle={styles.downIcon}
                  onSelect={(selected) => {
                    const tabObj = tabs.find((t) => t.value === selected);
                    _handleFilterSelect({ typeFilter: tabObj.value });
                  }}
                  onClose={() => setIsSmallScreenDropdownOpen(false)}
                />
              </div>

              <div className={css(styles.largeScreenFilters)}>
                {tabs.map((t) => renderTab(t, selectedFilters))}
              </div>

              <div className={css(styles.orderingContainer)}>
                <FeedOrderingDropdown
                  selectedFilters={selectedFilters}
                  selectedOrderingValue={selectedFilters.sort}
                  selectedScopeValue={selectedFilters.time}
                  onOrderingSelect={(selected) =>
                    _handleFilterSelect({ sort: selected.value })
                  }
                  onScopeSelect={(selected) =>
                    _handleFilterSelect({ timeScope: selected.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const topLevelFilterStyles = StyleSheet.create({
  container: {
    display: "flex",
    borderBottom: `1px solid ${colors.GREY_LINE(1)}`,
    width: "100%",
    marginBottom: 15,
  },
  filter: {
    padding: "0px 4px 12px 0px",
    display: "flex",
    position: "relative",
    marginRight: 25,
    alignItems: "center",
    cursor: "pointer",
    color: colors.BLACK(),
    ":hover": {
      color: colors.NEW_BLUE(),
    },
  },
  filterIcon: {
    marginRight: 5,
  },
  filterLabel: {},
  filterSelected: {
    borderBottom: `2px solid ${colors.NEW_BLUE()}`,
    color: colors.NEW_BLUE(),
  },
});

const styles = StyleSheet.create({
  downIcon: {
    marginTop: 2,
    padding: "0px 3px",
    fontSize: 14,
  },
  feedMenu: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  labelContainer: {
    display: "flex",
    height: "100%",
  },
  downIcon: {
    marginLeft: 5,
  },
  iconWrapper: {
    marginRight: 7,
    fontSize: 16,
    [`@media only screen and (max-width: 1350px)`]: {
      fontSize: 14,
      display: "none",
    },
    [`@media only screen and (max-width: 1200px)`]: {
      display: "block",
    },
  },
  filtersAsTabs: {
    width: "100%",
    display: "flex",
  },
  smallScreenFilters: {
    display: "none",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      display: "block",
    },
  },
  largeScreenFilters: {
    display: "flex",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      display: "none",
    },
  },
  tab: {
    position: "relative",
    color: colors.BLACK(0.6),
    background: colors.LIGHTER_GREY(1.0),
    padding: "4px 12px",
    marginRight: 10,
    textTransform: "unset",
    fontSize: 15,
    fontWeight: 400,
    borderRadius: 4,
    cursor: "pointer",
    ":active": {
      color: colors.NEW_BLUE(),
    },
    ":hover": {
      color: colors.NEW_BLUE(),
    },
    // [`@media only screen and (max-width: 1500px)`]: {
    //   fontSize: 15,
    // },
    [`@media only screen and (max-width: 1450px)`]: {
      marginRight: 10,
    },
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      height: "auto",
      ":last-child": {
        marginRight: 0,
      },
      ":first-child": {
        paddingLeft: 0,
      },
    },
  },

  tabSelected: {
    color: colors.NEW_BLUE(1.0),
    background: colors.LIGHTER_BLUE(1.0),
    // borderBottom: "solid 3px",
    // borderColor: colors.NEW_BLUE(),
  },
  moreOptsSelected: {
    color: colors.NEW_BLUE(),
    [`@media only screen and (max-width: 1450px)`]: {
      marginRight: 0,
    },
  },
  orderingContainer: {
    marginLeft: "auto",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      marginLeft: 10,
      alignSelf: "center",
      fontSize: 15,
    },
  },
  smallScreenFiltersDropdown: {
    padding: "8px 16px",
    display: "flex",
    borderRadius: 40,
    color: pillNavColors.primary.filledTextColor,
    backgroundColor: pillNavColors.primary.filledBackgroundColor,
    ":hover": {
      borderRadius: 40,
      backgroundColor: pillNavColors.primary.filledBackgroundColor,
    },
  },
  overridePopoverStyle: {
    width: "220px",
  },
  buttonGroup: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
    marginBottom: 10,
    overflow: "visible",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      flexDirection: "column-reverse",
    },
  },
  mainFilters: {
    height: "inherit",
    width: "100%",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      borderBottom: `unset`,
    },
  },
  filtersContainer: {
    marginBottom: 15,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      // marginBottom: 10,
    },
  },
});

const mapStateToProps = (state) => ({
  currentUser: state.auth.user,
});

export default connect(mapStateToProps, null)(UnifiedDocFeedMenu);
