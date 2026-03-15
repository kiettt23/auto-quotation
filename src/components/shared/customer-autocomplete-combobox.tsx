"use client";

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchCustomers } from "@/app/(dashboard)/documents/search-actions";

type CustomerResult = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
};

type Props = {
  onSelect: (customer: CustomerResult) => void;
};

/** Reusable customer search combobox with debounced server search */
export function CustomerAutocompleteCombobox({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerResult[]>([]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    const result = await searchCustomers(q);
    setResults(result.ok ? (result.value as CustomerResult[]) : []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Search className="mr-1 size-3.5" /> Tìm KH
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Tìm khách hàng..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>Không tìm thấy</CommandEmpty>
            <CommandGroup>
              {results.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => {
                    onSelect(c);
                    setOpen(false);
                    setQuery("");
                    setResults([]);
                  }}
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
