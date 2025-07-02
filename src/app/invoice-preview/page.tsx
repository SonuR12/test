"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function InvoicePreview() {
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("invoiceData");
    if (stored) {
      setInvoiceData(JSON.parse(stored));
    }
  }, []);

  if (!invoiceData) return <div className="p-6 text-sm">Loading invoice data...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
      <div className="p-4 sm:p-6 md:p-8 bg-white w-full max-w-4xl border rounded shadow-sm text-xs sm:text-sm text-gray-800">

        {/* Header */}
        <div className="border-b pb-4 mb-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-green-700">TAX INVOICE</h1>
          <p className="text-gray-600">Invoice Number: #{invoiceData.invoiceId}</p>
          <p className="text-gray-600">Invoice Date: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Seller & Buyer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div>
            <h2 className="font-semibold">Bill To:</h2>
            <p>{invoiceData.clientName}</p>
            <p>{invoiceData.clientAddress}</p>
            <p>GST IN: {invoiceData.gstNumber}</p>
          </div>
          <div>
            <h2 className="font-semibold">Sold By:</h2>
            <p>CLOUDSTORE RETAIL PRIVATE LIMITED</p>
            <p>Khasra No. 23//6/1, Village Bijwasan, New Delhi</p>
            <p>GSTIN: 07AAKCC0172C1Z3</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto border mb-4">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item: any, index: number) => {
                const qty = parseFloat(item.qty) || 0;
                const price = parseFloat(item.price) || 0;
                const total = qty * price;
                return (
                  <tr key={index}>
                    <td className="p-2 border">{item.description}</td>
                    <td className="p-2 border">{item.qty}</td>
                    <td className="p-2 border">₹{item.price}</td>
                    <td className="p-2 border">₹{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="w-full flex justify-end">
          <div className="w-full sm:w-84 md:w-96 p-4 space-y-2 border rounded">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{invoiceData.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{invoiceData.gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST:</span>
              <span>₹{invoiceData.sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST:</span>
              <span>₹{invoiceData.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount ({invoiceData.discount || 0}%):</span>
              <span>- ₹{invoiceData.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Grand Total:</span>
              <span className="text-green-700">₹{invoiceData.totalDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Print Button - hidden when printing */}
        <div className="flex justify-end mt-6 print:hidden">
          <Button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded"
          >
            Print Invoice
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-600">
          <p className="mt-1">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
