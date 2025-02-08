import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  label: string;
}

export function ColorPicker({ label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          className="w-12 h-12 p-1 cursor-pointer"
        />
        <Input
          type="text"
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
} 