import {
  Box,
  IconButton,
  InputAdornment,
  Typography,
  OutlinedInput,
} from "@mui/material";
import { Fragment, useState, ReactElement, useEffect } from "react";
import { fetchCurrentUserReferenceCitations } from "./api/fetchCurrentUserReferenceCitations";
import { useReferenceTabContext } from "./context/ReferencesTabContext";
import BasicTogglableNavbarLeft, {
  LEFT_MAX_NAV_WIDTH,
  LEFT_MIN_NAV_WIDTH,
} from "../shared/basic_page_layout/BasicTogglableNavbarLeft";
import DropdownMenu from "../shared/menu/DropdownMenu";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ReferenceItemTab from "./reference_item/ReferenceItemTab";
import ReferencesTable from "./ReferencesTable";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { emptyFncWithMsg } from "~/config/utils/nullchecks";

interface Props {}

function useEffectFetchReferenceCitations({ onSuccess, onError }) {
  // NOTE: current we are assuming that citations only belong to users. In the future it may belong to orgs
  useEffect(() => {
    fetchCurrentUserReferenceCitations({ onSuccess, onError });
  }, [fetchCurrentUserReferenceCitations, onSuccess, onError]);
}

export default function ReferencesContainer({}: Props): ReactElement {
  const [searchText, setSearchText] = useState<string | null>(null);
  const [isLeftNavOpen, setIsLeftNavOpen] = useState<boolean>(true);
  const { setReferenceItemData } = useReferenceTabContext();
  const leftNavWidth = isLeftNavOpen ? LEFT_MAX_NAV_WIDTH : LEFT_MIN_NAV_WIDTH;

  useEffectFetchReferenceCitations({
    onSuccess: (result) => {
      debugger;
      setReferenceItemData({});
    },
    onError: emptyFncWithMsg,
  });

  return (
    <Fragment>
      <ReferenceItemTab />
      <Box flexDirection="row" display="flex">
        <BasicTogglableNavbarLeft
          isOpen={isLeftNavOpen}
          navWidth={leftNavWidth}
          setIsOpen={setIsLeftNavOpen}
          // theme={theme}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "32px 32px",
            width: "100%",
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {"All References"}
            </Typography>
          </div>
          <Box className="ReferencesContainerMain">
            <Box
              className="ReferencesContainerTitleSection"
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                height: 44,
                marginBottom: "20px",
              }}
            >
              <DropdownMenu
                menuItemProps={[
                  { itemLabel: "File(s) from computer", onClick: () => {} },
                  { itemLabel: "Import library", onClick: () => {} },
                ]}
                menuLabel={
                  <div
                    style={{
                      alignItems: "center",
                      color: "rgba(170, 168, 180, 1)",
                      display: "flex",
                      justifyContent: "space-between",
                      width: 68,
                      height: 26,
                      boxSizing: "border-box",
                    }}
                  >
                    <TableChartOutlinedIcon
                      fontSize="medium"
                      sx={{ color: "#7C7989" }}
                    />
                    <ExpandMore fontSize="medium" sx={{ color: "#AAA8B4" }} />
                  </div>
                }
                size="medium"
              />
              <div
                className="ReferenceContainerSearchFieldWrap"
                style={{
                  maxWidth: 400,
                  width: "100%",
                }}
              >
                <OutlinedInput
                  fullWidth
                  label={searchText && "Search"}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    // TODO: calvinhlee - create a MUI convenience function for handling target values
                    setSearchText(event.target.value);
                  }}
                  placeholder="Search..."
                  size="small"
                  sx={{
                    borderColor: "#E9EAEF",
                    background: "rgba(250, 250, 252, 1)",
                    "&:hover": {
                      borderColor: "#E9EAEF",
                    },
                  }}
                  inputProps={{
                    sx: {
                      border: "0px !important",
                      "&:hover": {
                        border: "0px",
                      },
                    },
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        edge="end"
                      >
                        <i
                          className="fa-regular fa-magnifying-glass"
                          style={{ fontSize: 16 }}
                        ></i>
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </div>
            </Box>
            <ReferencesTable />
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
}
