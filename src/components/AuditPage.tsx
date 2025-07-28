import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginRecords from "./LoginRecords";
import OperationLogs from "./OperationLogs";

const loginRecords = [
  {
    id: '1',
    user_name: 'admin',
    ip_address: '192.168.1.1',
    location: 'New York, USA',
    device_info: 'Chrome on macOS',
    timestamp: '2024-07-26T10:00:00Z',
  },
  {
    id: '2',
    user_name: 'user1',
    ip_address: '10.0.0.5',
    location: 'London, UK',
    device_info: 'Firefox on Windows',
    timestamp: '2024-07-26T09:30:00Z',
  },
];

const operationLogs = [
  {
    id: '1',
    user_name: 'admin',
    operation_type: 'Update',
    operation_location: '/dashboard',
    operation_result: 'success' as const,
    timestamp: '2024-07-26T10:05:00Z',
  },
  {
    id: '2',
    user_name: 'user1',
    operation_type: 'Read',
    operation_location: '/dashboard',
    operation_result: 'success' as const,
    timestamp: '2024-07-26T09:35:00Z',
  },
];

export default function AuditPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
      </div>
      <Tabs defaultValue="login-records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="login-records">Login Records</TabsTrigger>
          <TabsTrigger value="operation-logs">Operation Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="login-records" className="space-y-4">
          <LoginRecords records={loginRecords} />
        </TabsContent>
        <TabsContent value="operation-logs" className="space-y-4">
          <OperationLogs logs={operationLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
