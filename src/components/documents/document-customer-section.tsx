"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  customers: Array<{
    id: string;
    name: string;
    address: string | null;
    receiverName: string | null;
    receiverPhone: string | null;
  }>;
  customerId: string;
  customerName: string;
  customerAddress: string;
  receiverName: string;
  receiverPhone: string;
  onCustomerSelect: (id: string) => void;
  onCustomerNameChange: (v: string) => void;
  onCustomerAddressChange: (v: string) => void;
  onReceiverNameChange: (v: string) => void;
  onReceiverPhoneChange: (v: string) => void;
}

export function DocumentCustomerSection({
  customers,
  customerId,
  customerName,
  customerAddress,
  receiverName,
  receiverPhone,
  onCustomerSelect,
  onCustomerNameChange,
  onCustomerAddressChange,
  onReceiverNameChange,
  onReceiverPhoneChange,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        Thông tin khách hàng
      </h2>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Khách hàng">
            <Select value={customerId} onValueChange={onCustomerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khách hàng..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tên khách hàng">
            <Input
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Tên khách hàng"
            />
          </Field>
        </div>
        <Field label="Địa chỉ">
          <Input
            value={customerAddress}
            onChange={(e) => onCustomerAddressChange(e.target.value)}
            placeholder="Auto-fill khi chọn KH"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Người nhận">
            <Input
              value={receiverName}
              onChange={(e) => onReceiverNameChange(e.target.value)}
              placeholder="Tên người nhận"
            />
          </Field>
          <Field label="Số điện thoại">
            <Input
              value={receiverPhone}
              onChange={(e) => onReceiverPhoneChange(e.target.value)}
              placeholder="SĐT người nhận"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  );
}
