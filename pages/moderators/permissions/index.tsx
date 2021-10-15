import { useStore } from "react-redux";
import { ReactElement } from "react";
import { useEffectCheckCredentials } from "../useEffectCheckCredentials";
import PermissionsDashboard from "~/components/PermissionsDashboard/PermissionsDashboard";

export default function PermissionsDashboardIndex(): ReactElement<
  typeof PermissionsDashboard
> | null {
  const reduxStore = useStore();
  const shouldRenderUI = useEffectCheckCredentials(reduxStore);
  if (!shouldRenderUI) {
    return null;
  }
  return <PermissionsDashboard />;
}
