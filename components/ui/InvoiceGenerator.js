
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Image from "next/image";

export default function InvoiceGenerator() {
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0, vatRate: 15 }]);

  const calculateTotals = () => {
    return items.map((item) => {
      const inclTotal = item.quantity * item.price;
      const exclusive = item.vatRate === 0 ? inclTotal : inclTotal / (1 + item.vatRate / 100);
      const vatAmount = inclTotal - exclusive;
      return { ...item, inclTotal, exclusive, vatAmount };
    });
  };

  const generatePDF = () => {
    const calculated = calculateTotals();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("GROCERMAX INVOICE", 14, 20);
    doc.setFontSize(12);
    doc.text("21 Ebonywood Avenue, Heuweloord, Pretoria", 14, 30);
    doc.text("VAT No: 4290318221", 14, 36);
    doc.text("Email: your@email.com | Phone: [Your Phone]", 14, 42);

    autoTable(doc, {
      startY: 55,
      head: [["Description", "Quantity", "Incl Price", "VAT %", "Exclusive", "Total Inc."]],
      body: calculated.map((item) => [
        item.description,
        item.quantity,
        `R${item.price.toFixed(2)}`,
        `${item.vatRate}%`,
        `R${item.exclusive.toFixed(2)}`,
        `R${item.inclTotal.toFixed(2)}`
      ])
    });

    const totals = calculated.reduce((acc, item) => {
      acc.exclusive += item.exclusive;
      acc.vat += item.vatAmount;
      acc.total += item.inclTotal;
      return acc;
    }, { exclusive: 0, vat: 0, total: 0 });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Exclusive: R${totals.exclusive.toFixed(2)}`, 14, finalY);
    doc.text(`Total VAT: R${totals.vat.toFixed(2)}`, 14, finalY + 6);
    doc.setFontSize(13);
    doc.text(`Total Due: R${totals.total.toFixed(2)}`, 14, finalY + 14);

    doc.save("GrocerMax_Invoice.pdf");
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'description' ? value : Number(value);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, vatRate: 15 }]);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">GrocerMax Invoice Generator</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-4">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Incl Price (R)"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
              />
              <Input
                type="number"
                placeholder="VAT %"
                value={item.vatRate}
                onChange={(e) => updateItem(index, 'vatRate', e.target.value)}
              />
            </div>
          ))}
          <Button onClick={addItem}>Add Item</Button>
          <Button onClick={generatePDF}>Download PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}
