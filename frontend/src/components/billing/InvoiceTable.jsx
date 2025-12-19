import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

export function InvoiceTable({ invoices }) {
    if (!invoices || invoices.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/10">
                <p>No invoices found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell>
                                {new Date(invoice.created).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {(invoice.amount_paid / 100).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: invoice.currency.toUpperCase()
                                })}
                            </TableCell>
                            <TableCell>
                                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                    {invoice.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {invoice.pdf_url && (
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2 h-4 w-4" />
                                            PDF
                                        </a>
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
