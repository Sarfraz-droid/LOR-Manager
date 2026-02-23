import { SopEntry, SopStatus } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Building2, PenTool, Trash2 } from "lucide-react";

interface SopRowProps {
  sop: SopEntry;
  onStatusChange: (id: string, status: SopStatus) => void;
  onWrite: (sop: SopEntry) => void;
  onDelete: (id: string) => void;
}

export function SopRow({ sop, onStatusChange, onWrite, onDelete }: SopRowProps) {
  const isUrgent =
    new Date(sop.deadline).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 7;

  return (
    <TableRow className="group">
      <TableCell className="font-medium">
        <span className="flex items-center gap-2 text-primary">
          <Building2 className="h-3 w-3" />
          {sop.college}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{sop.program}</TableCell>
      <TableCell>
        <div
          className={`flex items-center gap-2 text-sm ${
            isUrgent && sop.status !== "Finalized" ? "text-destructive font-bold" : ""
          }`}
        >
          <Calendar className="h-4 w-4" />
          {format(new Date(sop.deadline), "MMM d, yyyy")}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Select
            defaultValue={sop.status}
            onValueChange={(val) => onStatusChange(sop.id, val as SopStatus)}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs font-medium border-accent/20 focus:ring-accent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Finalized">Finalized</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWrite(sop)}
            className="h-8 text-accent hover:text-accent hover:bg-accent/10"
          >
            <PenTool className="h-3.5 w-3.5 mr-1" />
            Write
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Badge
          variant={
            sop.status === "Finalized"
              ? "default"
              : sop.status === "In Progress"
              ? "secondary"
              : "outline"
          }
          className={sop.status === "Finalized" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {sop.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(sop.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete SOP"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
