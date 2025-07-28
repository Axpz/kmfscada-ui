import React, { useState, useEffect } from 'react';
import { OperationLog } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from 'react-day-picker';
import { Badge } from "@/components/ui/badge";

interface OperationLogsProps {
  logs: OperationLog[];
}

export default function OperationLogs({ logs }: OperationLogsProps) {
  const [filteredLogs, setFilteredLogs] = useState<OperationLog[]>(logs);
  const [operationType, setOperationType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    let newFilteredLogs = logs;

    if (operationType && operationType !== 'all') {
      newFilteredLogs = newFilteredLogs.filter(log => log.operation_type === operationType);
    }

    if (dateRange?.from && dateRange.to) {
      newFilteredLogs = newFilteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= dateRange.from! && logDate <= dateRange.to!;
      });
    }

    setFilteredLogs(newFilteredLogs);
  }, [logs, operationType, dateRange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select onValueChange={setOperationType} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Create">Create</SelectItem>
            <SelectItem value="Read">Read</SelectItem>
            <SelectItem value="Update">Update</SelectItem>
            <SelectItem value="Delete">Delete</SelectItem>
          </SelectContent>
        </Select>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Operation Type</TableHead>
              <TableHead>Operation Location</TableHead>
              <TableHead>Operation Result</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.user_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.operation_type}</Badge>
                </TableCell>
                <TableCell>{log.operation_location}</TableCell>
                <TableCell>
                  <Badge variant={log.operation_result === 'success' ? 'default' : 'destructive'}>
                    {log.operation_result}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}