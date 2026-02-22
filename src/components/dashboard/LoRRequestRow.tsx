import { LoRRequest, Professor, UniversityApplication, LoRStatus } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, Building2, User } from "lucide-react";

interface LoRRequestRowProps {
  request: LoRRequest;
  professor?: Professor;
  application?: UniversityApplication;
  onStatusChange: (id: string, status: LoRStatus) => void;
}

export function LoRRequestRow({ request, professor, application, onStatusChange }: LoRRequestRowProps) {
  const isUrgent = new Date(request.deadline).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 7;

  return (
    <TableRow className="group">
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="flex items-center gap-2 text-primary">
            <User className="h-3 w-3" />
            {professor?.name || "Unknown Professor"}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {professor?.email}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            <Building2 className="h-3 w-3 text-accent" />
            {application?.university || "Unknown University"}
          </span>
          <span className="text-xs text-muted-foreground">
            {application?.program}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className={`flex items-center gap-2 text-sm ${isUrgent && request.status !== 'Submitted' ? 'text-destructive font-bold' : ''}`}>
          <Calendar className="h-4 w-4" />
          {format(new Date(request.deadline), "MMM d, yyyy")}
        </div>
      </TableCell>
      <TableCell>
        <Select
          defaultValue={request.status}
          onValueChange={(val) => onStatusChange(request.id, val as LoRStatus)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs font-medium border-accent/20 focus:ring-accent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Requested">Requested</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <Badge
          variant={
            request.status === "Submitted"
              ? "default"
              : request.status === "In Progress"
              ? "secondary"
              : "outline"
          }
          className={request.status === "Submitted" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {request.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
}