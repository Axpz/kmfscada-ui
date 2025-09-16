import React, { useState, useEffect } from 'react';
import { LoginRecord } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";

interface LoginRecordsProps {
  records: LoginRecord[];
}

export default function LoginRecords({ records }: LoginRecordsProps) {
  const [filteredRecords, setFilteredRecords] = useState<LoginRecord[]>(records);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    let newFilteredRecords = records;

    if (searchTerm) {
      newFilteredRecords = newFilteredRecords.filter(record =>
        record.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange?.from && dateRange.to) {
      newFilteredRecords = newFilteredRecords.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= dateRange.from! && recordDate <= dateRange.to!;
      });
    }

    setFilteredRecords(newFilteredRecords);
  }, [records, searchTerm, dateRange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by user..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.user_name}</TableCell>
                <TableCell>{record.ip_address}</TableCell>
                <TableCell>{record.location}</TableCell>
                <TableCell>{record.device_info}</TableCell>
                <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}