"use client";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { useState } from "react";

// ✅ Zod schema
const itemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  qty: z.string().min(1, "Qty is required"), 
  price: z.string().min(1, "Price is required"),
});

const invoiceSchema = z.object({
  clientName: z.string().min(1, "Client Name is required"),
  clientAddress: z.string().min(1, "Client Address is required"),
  gst: z.string().min(1, "GST is required"),
  discount: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function InvoiceForm() {

  function generateInvoiceID() {
    return Math.floor(Math.random() * 10000000000).toString();
  }

  const [invoiceId] = useState(() => generateInvoiceID());

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientName: "",
      clientAddress: "",
      gst: "",
      discount: "",
      items: [{ description: "", qty: "", price: "" }],
    },
  });

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;
  const { fields, append } = useFieldArray({ control, name: "items" });

  const gst = parseFloat(watch("gst") || "7");
  const discount = parseFloat(watch("discount") || "0");
  const items = watch("items");

  const subTotal = items.reduce((acc, item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    return acc + qty * price;
  }, 0);

  const gstAmount = (gst / 100) * subTotal;
  const discountAmount = (discount / 100) * (subTotal + gstAmount);
  const taxableAmount = subTotal + gstAmount - discountAmount;
  const sgst = gstAmount / 2;
  const cgst = gstAmount / 2;
  const totalDue = taxableAmount;

  const onSubmit = (data: InvoiceFormData) => {
    console.log("Submitted:", data);
    window.print();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <main className="bg-[#f6fcf8] min-h-screen p-4 md:p-8 font-sans">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-700">Invoice</h1>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <div className="font-bold text-base md:text-lg">Invoice generator</div>
              </div>
            </div>
          </div>

          {/* Billed To & Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="font-semibold mb-1">Invoice Details</div>
              <div className="pl-2 pb-4">
                Invoice ID - <span>{invoiceId}</span>
              </div>
              <Input type="date" placeholder="Invoice Date" className="mb-1" />
              <Input type="number" placeholder="GST No." className="mb-1" {...register("gst")} />
              {errors.gst && (
                <p className="text-red-500 text-xs mt-1">{errors.gst.message}</p>
              )}
            </div>
            <div>
              <div className="font-semibold mb-1">Billed to</div>
              <Input
                placeholder="Client Name"
                className="mb-1"
                {...register("clientName")}
              />
              {errors.clientName && (
                <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>
              )}

              <Input
                placeholder="Client Address" 
                className="mt-1"
                {...register("clientAddress")}
              />
              {errors.clientAddress && (
                <p className="text-red-500 text-xs mt-1">{errors.clientAddress.message}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
         <div className="bg-white rounded shadow mb-6 overflow-x-auto">
  <div className="min-w-[800px]">
    <table className="w-full text-sm md:text-base">
      <thead className="bg-green-100">
        <tr className="[&>th]:p-2 md:[&>th]:p-3 [&>th]:whitespace-nowrap">
          <th>#</th>
          <th>Item</th>
          <th>Qty.</th>
          <th>Price</th>
          <th>GST (%)</th>
          <th>Taxable Amt</th>
          <th>SGST</th>
          <th>CGST</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((item, idx) => {
          const qty = parseFloat(items[idx]?.qty || "0") || 0;
          const price = parseFloat(items[idx]?.price || "0") || 0;
          const base = qty * price;
          const itemGst = (gst / 100) * base;
          const itemSgst = itemGst / 2;
          const itemCgst = itemGst / 2;
          const amount = base + itemGst;

          return (
            <tr key={item.id} className="border-b [&>td]:p-2 md:[&>td]:p-3">
              <td>{idx + 1}</td>
              <td className="min-w-[180px]">
                <Input
                  placeholder="Description"
                  {...register(`items.${idx}.description`)}
                />
                {errors.items?.[idx]?.description && (
                  <p className="text-red-500 text-xs">
                    {errors.items[idx].description?.message}
                  </p>
                )}
              </td>
              <td>
                <Input
                  type="number"
                  placeholder="Qty"
                  {...register(`items.${idx}.qty`)}
                />
                {errors.items?.[idx]?.qty && (
                  <p className="text-red-500 text-xs">
                    {errors.items[idx].qty?.message}
                  </p>
                )}
              </td>
              <td>
                <Input
                  type="number"
                  placeholder="Price"
                  {...register(`items.${idx}.price`)}
                />
                {errors.items?.[idx]?.price && (
                  <p className="text-red-500 text-xs">
                    {errors.items[idx].price?.message}
                  </p>
                )}
              </td>
              <td>
                <Input
                  type="number"
                  placeholder="GST"
                  value={gst}
                  onChange={(e) => form.setValue("gst", e.target.value)}
                />
              </td>
              <td className="text-center whitespace-nowrap">₹{base.toFixed(2)}</td>
              <td className="text-center whitespace-nowrap">₹{itemSgst.toFixed(2)}</td>
              <td className="text-center whitespace-nowrap">₹{itemCgst.toFixed(2)}</td>
              <td className="text-center whitespace-nowrap">₹{amount.toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {/* Add Item Button */}
  <div className="p-2">
    <Button
      type="button"
      variant="outline"
      onClick={() => append({ description: "", qty: "", price: "" })}
    >
      + Add Item
    </Button>
  </div>

  {/* Discount Field */}
  <div className="p-2 space-y-1">
    <Label>Discount (%) Optional</Label>
    <Input
      className="w-full sm:w-32"
      placeholder="Enter Discount"
      {...register("discount")}
    />
  </div>
</div>


          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-96">
              <div className="flex flex-col">
                <div className="flex justify-between mb-1">
                  <span>Sub Total</span>
                  <span>₹{subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Discount ({discount || 0}%)</span>
                  <span>
                    - ₹
                    {discountAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Taxable Amount</span>
                  <span>
                    ₹
                    {taxableAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>SGST</span>
                  <span>
                    ₹
                    {sgst.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>CGST</span>
                  <span>
                    ₹
                    {cgst.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 text-lg font-bold">
                  <span>Total Due</span>
                  <span className="text-green-700">
                    ₹{totalDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-8 gap-4">
            <Button type="submit" className="bg-green-600 w-full md:w-auto">
              Generate Invoice
            </Button>
          </div>
        </main>
      </form>
    </Form>
  );
}
