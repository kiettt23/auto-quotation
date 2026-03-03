"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchCustomers } from "@/app/(dashboard)/bao-gia/actions";
import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { QuoteFormValues } from "@/lib/validations/quote-schemas";

type Props = {
  register: UseFormRegister<QuoteFormValues>;
  watch: UseFormWatch<QuoteFormValues>;
  setValue: UseFormSetValue<QuoteFormValues>;
  errors: FieldErrors<QuoteFormValues>;
};

type CustomerResult = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
};

export function QuoteCustomerSection({ register, watch, setValue, errors }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerResult[]>([]);
  const customerId = watch("customerId");

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 1) { setResults([]); return; }
    const data = await searchCustomers(q);
    setResults(data as CustomerResult[]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  function selectCustomer(c: CustomerResult) {
    setValue("customerId", c.id);
    setValue("customerName", c.name);
    setValue("customerCompany", c.company ?? "");
    setValue("customerPhone", c.phone ?? "");
    setValue("customerEmail", c.email ?? "");
    setValue("customerAddress", c.address ?? "");
    setSearchOpen(false);
  }

  function clearCustomer() {
    setValue("customerId", null);
    setValue("customerName", "");
    setValue("customerCompany", "");
    setValue("customerPhone", "");
    setValue("customerEmail", "");
    setValue("customerAddress", "");
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Khách hàng</CardTitle>
          {customerId ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearCustomer}>
              <X className="mr-1 size-3.5" /> Xóa
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="mr-1 size-3.5" /> Tìm KH
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {searchOpen && !customerId && (
          <Command className="rounded-lg border">
            <CommandInput placeholder="Tìm khách hàng..." value={query} onValueChange={setQuery} />
            <CommandList>
              <CommandEmpty>Không tìm thấy</CommandEmpty>
              <CommandGroup>
                {results.map((c) => (
                  <CommandItem key={c.id} onSelect={() => selectCustomer(c)}>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel>Tên khách hàng</FieldLabel>
            <Input {...register("customerName")} readOnly={!!customerId} />
          </Field>
          <Field>
            <FieldLabel>Công ty</FieldLabel>
            <Input {...register("customerCompany")} readOnly={!!customerId} />
          </Field>
          <Field>
            <FieldLabel>Điện thoại</FieldLabel>
            <Input {...register("customerPhone")} readOnly={!!customerId} />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input {...register("customerEmail")} readOnly={!!customerId} />
          </Field>
        </div>
        {errors.customerName && (
          <p className="text-xs text-destructive">{errors.customerName.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
