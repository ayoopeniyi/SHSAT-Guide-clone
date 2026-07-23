import React, { useState, useEffect } from "react";
import { testPackService } from "../services/testPackService";
import { TestPack } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Loader2, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../stores/authStore";

export default function ManageTestsPage() {
  const [tests, setTests] = useState<TestPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/teacher-dashboard");
      return;
    }
    loadTests();
  }, [isAdmin, authLoading, navigate]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await testPackService.getAll(true); // showAll = true
      setTests(data);
    } catch (error) {
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (testId: number, field: "is_active" | "is_live", value: boolean) => {
    try {
      await testPackService.toggleTestStatus(testId, field, value);
      setTests(tests.map(t => t.id === testId ? { ...t, [field]: value } : t));
      toast.success(`${field.replace('is_', '')} status updated`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredTests = tests.filter(t => 
    (t.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/teachers")} 
          className="mb-6 text-gray-500 hover:text-gray-700 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Test Visibility</h1>
            <p className="text-gray-500 mt-1">Manage which tests are visible to students and teachers.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search tests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#1d99c6]" />
            <p className="mt-4 text-gray-500">Loading tests...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Test Name</TableHead>
                  <TableHead className="w-48 text-center font-semibold text-gray-700">Visibility Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <TableRow key={test.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-900 py-4">{test.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-3">
                          <span className={`text-xs font-medium ${test.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                            {test.is_active ? 'Visible' : 'Hidden'}
                          </span>
                          <Switch 
                            checked={!!test.is_active} 
                            onCheckedChange={(val) => handleToggle(test.id, "is_active", val)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-gray-500 italic">
                      No tests found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
