import Badge from "../ui/Badge";
import { formatStatus, getStatusBadgeVariant } from "../../utils/status";

export default function StatusBadge({ value, children }) {
  const label = children || formatStatus(value);

  return <Badge variant={getStatusBadgeVariant(value)}>{label}</Badge>;
}
