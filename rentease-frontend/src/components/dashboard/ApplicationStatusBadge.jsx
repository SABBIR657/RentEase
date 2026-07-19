import Badge from "../common/Badge";
import { APPLICATION_STATUS_COLORS } from "../../utils/constants";

const variantMap = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  withdrawn: "gray",
};

export default function ApplicationStatusBadge({ status }) {
  return (
    <Badge variant={variantMap[status] || "gray"}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </Badge>
  );
}
