import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Calendar, ChefHat } from "lucide-react";

export default function StaffCards() {
  return (
    <div className="flex gap-4">
      <Card className="flex-1 bg-white border-l-4 border-l-[#835427] shadow-sm">
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Employees
            </span>
            <span className="text-2xl font-bold">12</span>
          </div>
          <div className="p-2 bg-orange-100 text-orange-800 rounded-md">
            <Users className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 bg-white border-l-4 border-l-[#A2CB8B] shadow-sm">
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              On Shift Today
            </span>
            <span className="text-2xl font-bold">12</span>
          </div>
          <div className="p-2 bg-green-100 text-green-600 rounded-md">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 bg-white border-l-4 border-l-[#F7C85C] shadow-sm">
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Upcoming Leave
            </span>
            <span className="text-2xl font-bold">12</span>
          </div>
          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md">
            <Calendar className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 bg-white border-l-4 border-l-[#547A95] shadow-sm">
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Chef
            </span>
            <span className="text-2xl font-bold">3</span>
          </div>
          <div className="p-2 bg-slate-100 text-slate-500 rounded-md">
            <ChefHat className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}