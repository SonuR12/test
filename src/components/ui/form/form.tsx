"use client";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ✅ Zod schema
const itemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  qty: z.string().refine(val => parseFloat(val) >= 0, {
    message: "Qty must be 0 or more",
  }),
  price: z.string().refine(val => parseFloat(val) >= 0, {
    message: "Price must be 0 or more",
  }),
  gstPercentage: z.string().refine(val => parseFloat(val) >= 0, {
    message: "GST % must be 0 or more",
  }),
});

const invoiceSchema = z.object({
  clientName: z.string().min(1, "Client Name is required"),
  clientAddress: z.string().min(1, "Client Address is required"),
  gstNumber: z.string().min(1, "GST Number is required"),
  discount: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function InvoiceForm() {
  const router = useRouter();
  const [invoiceId] = useState(() => Math.floor(Math.random() * 10000000000).toString());

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientName: "",
      clientAddress: "",
      gstNumber: "",
      discount: "",
      items: [{ description: "", qty: "", price: "", gstPercentage: "" }],
    },
  });

  const { register, control, watch, handleSubmit, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const discount = parseFloat(watch("discount") || "0");
  const items = watch("items");

  // Totals
  const subTotal = items.reduce((acc, item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    return acc + qty * price;
  }, 0);

  const gstAmount = items.reduce((acc, item) => {
    const qty = parseFloat(item.qty || "0");
    const price = parseFloat(item.price || "0");
    const gstRate = parseFloat(item.gstPercentage || "0");
    const base = qty * price;
    return acc + (gstRate / 100) * base;
  }, 0);

  const sgst = gstAmount / 2;
  const cgst = gstAmount / 2;
  const discountAmount = (discount / 100) * (subTotal + gstAmount);
  const taxableAmount = subTotal + gstAmount - discountAmount;
  const totalDue = taxableAmount;

  const onSubmit = (data: InvoiceFormData) => {
    const fullData = {
      ...data,
      invoiceId,
      subTotal,
      gstAmount,
      discountAmount,
      taxableAmount,
      sgst,
      cgst,
      totalDue,
    };
    localStorage.setItem("invoiceData", JSON.stringify(fullData));
    router.push("/invoice-preview");
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <main className="bg-[#f6fcf8] min-h-screen p-4 md:p-8 font-sans">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-green-700">Invoice</h1>
            <div className="font-bold text-base md:text-lg">Invoice Generator</div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="font-semibold mb-1">Invoice Details</div>
              <div className="pl-2 pb-4">Invoice ID - <span>{invoiceId}</span></div>
              <Input type="date" placeholder="Invoice Date" className="mb-1" />
              <Input placeholder="GST Number" className="mb-1" {...register("gstNumber")} />
              {errors.gstNumber && <p className="text-red-500 text-xs">{errors.gstNumber.message}</p>}
            </div>
            <div>
              <div className="font-semibold mb-1">Billed to</div>
              <Input placeholder="Client Name" className="mb-1" {...register("clientName")} />
              {errors.clientName && <p className="text-red-500 text-xs">{errors.clientName.message}</p>}
              <Input placeholder="Client Address" className="mt-1" {...register("clientAddress")} />
              {errors.clientAddress && <p className="text-red-500 text-xs">{errors.clientAddress.message}</p>}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded shadow mb-6 overflow-x-auto">
            <div className="min-w-[900px]">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-green-100">
                  <tr className="[&>th]:p-2 md:[&>th]:p-3 [&>th]:whitespace-nowrap">
                    <th>#</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>GST (%)</th>
                    <th>Taxable</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((item, idx) => {
                    const qty = parseFloat(items[idx]?.qty || "0") || 0;
                    const price = parseFloat(items[idx]?.price || "0") || 0;
                    const gstRate = parseFloat(items[idx]?.gstPercentage || "0") || 0;
                    const base = qty * price;
                    const itemGst = (gstRate / 100) * base;
                    const itemSgst = itemGst / 2;
                    const itemCgst = itemGst / 2;
                    const amount = base + itemGst;

                    return (
                      <tr key={item.id} className="border-b [&>td]:p-2 md:[&>td]:p-3">
                        <td>{idx + 1}</td>
                        <td>
                          <Input placeholder="Description" {...register(`items.${idx}.description`)} />
                          {errors.items?.[idx]?.description && (
                            <p className="text-red-500 text-xs">{errors.items[idx].description?.message}</p>
                          )}
                        </td>
                        <td>
                          <Input
                            type="number"
                            placeholder="Qty"
                            min="0"
                            {...register(`items.${idx}.qty`)}
                          />
                          {errors.items?.[idx]?.qty && (
                            <p className="text-red-500 text-xs">{errors.items[idx].qty?.message}</p>
                          )}
                        </td>
                        <td>
                          <Input
                            type="number"
                            placeholder="Price"
                            min="0"
                            {...register(`items.${idx}.price`)}
                          />
                          {errors.items?.[idx]?.price && (
                            <p className="text-red-500 text-xs">{errors.items[idx].price?.message}</p>
                          )}
                        </td>
                        <td>
                          <Input
                            type="number"
                            placeholder="GST %"
                            min="0"
                            {...register(`items.${idx}.gstPercentage`)}
                            value={items[idx]?.gstPercentage === "0" ? "" : items[idx]?.gstPercentage}
                            onChange={(e) => form.setValue(`items.${idx}.gstPercentage`, e.target.value)}
                          />
                          {errors.items?.[idx]?.gstPercentage && (
                            <p className="text-red-500 text-xs">{errors.items[idx].gstPercentage?.message}</p>
                          )}
                        </td>
                        <td className="text-center">₹{base.toFixed(2)}</td>
                        <td className="text-center">₹{itemSgst.toFixed(2)}</td>
                        <td className="text-center">₹{itemCgst.toFixed(2)}</td>
                        <td className="text-center">₹{amount.toFixed(2)}</td>
                        <td>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => remove(idx)}
                            >
                              Remove
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add & Discount */}
            <div className="space-y-4 md:space-y-0 md:flex justify-between items-center px-2 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ description: "", qty: "", price: "", gstPercentage: "" })}
              >
                + Add Item
              </Button>
              <div>
                <Label>Discount (%) Optional</Label>
                <Input min={0} type="number" className="w-32 mt-1" placeholder="Enter Discount" {...register("discount")} />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-96 space-y-1">
              <div className="flex justify-between"><span>Sub Total</span><span>₹{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount ({discount || 0}%)</span><span>- ₹{discountAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Taxable Amount</span><span>₹{taxableAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>SGST</span><span>₹{sgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>CGST</span><span>₹{cgst.toFixed(2)}</span></div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total Due</span><span className="text-green-700">₹{totalDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-8">
            <Button type="submit" className="bg-green-600 w-full md:w-auto">
              Generate Invoice
            </Button>
          </div>
        </main>
      </form>
    </Form>
  );
}
