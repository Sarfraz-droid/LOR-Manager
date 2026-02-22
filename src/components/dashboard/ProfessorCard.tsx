import { Professor } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, GraduationCap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfessorCardProps {
  professor: Professor;
  onDelete?: (id: string) => void;
}

export function ProfessorCard({ professor, onDelete }: ProfessorCardProps) {
  return (
    <Card className="hover:shadow-md transition-all border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-primary flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            {professor.name}
          </CardTitle>
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(professor.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Mail className="h-4 w-4" />
          {professor.email}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-2">Expertise: {professor.expertise}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {professor.courses.map((course, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] font-literata">
              {course}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}