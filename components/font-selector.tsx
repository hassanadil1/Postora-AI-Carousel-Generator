"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Popular web-safe and Google fonts
const fonts = [
  { value: "arial", label: "Arial", family: "Arial, sans-serif" },
  { value: "helvetica", label: "Helvetica", family: "Helvetica, Arial, sans-serif" },
  { value: "times-new-roman", label: "Times New Roman", family: "'Times New Roman', Times, serif" },
  { value: "courier-new", label: "Courier New", family: "'Courier New', Courier, monospace" },
  { value: "verdana", label: "Verdana", family: "Verdana, Geneva, sans-serif" },
  { value: "georgia", label: "Georgia", family: "Georgia, serif" },
  { value: "palatino", label: "Palatino", family: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { value: "garamond", label: "Garamond", family: "Garamond, serif" },
  { value: "bookman", label: "Bookman", family: "'Bookman Old Style', serif" },
  { value: "trebuchet-ms", label: "Trebuchet MS", family: "'Trebuchet MS', Helvetica, sans-serif" },
  { value: "impact", label: "Impact", family: "Impact, Charcoal, sans-serif" },
  
  // Google Fonts
  { value: "roboto", label: "Roboto", family: "'Roboto', sans-serif" },
  { value: "open-sans", label: "Open Sans", family: "'Open Sans', sans-serif" },
  { value: "lato", label: "Lato", family: "'Lato', sans-serif" },
  { value: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif" },
  { value: "raleway", label: "Raleway", family: "'Raleway', sans-serif" },
  { value: "poppins", label: "Poppins", family: "'Poppins', sans-serif" },
  { value: "oswald", label: "Oswald", family: "'Oswald', sans-serif" },
  { value: "playfair-display", label: "Playfair Display", family: "'Playfair Display', serif" },
  { value: "merriweather", label: "Merriweather", family: "'Merriweather', serif" },
  { value: "nunito", label: "Nunito", family: "'Nunito', sans-serif" },
  { value: "fira-sans", label: "Fira Sans", family: "'Fira Sans', sans-serif" },
  { value: "mulish", label: "Mulish", family: "'Mulish', sans-serif" },
];

export interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const [open, setOpen] = React.useState(false);
  
  // Find the selected font object
  const selectedFont = fonts.find((font) => font.value === value) || fonts[0];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Brand Font</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            style={{ fontFamily: selectedFont.family }}
          >
            {value ? selectedFont.label : "Select font..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search font..." />
            <CommandEmpty>No font found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {fonts.map((font) => (
                <CommandItem
                  key={font.value}
                  value={font.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                  style={{ fontFamily: font.family }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === font.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {font.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 