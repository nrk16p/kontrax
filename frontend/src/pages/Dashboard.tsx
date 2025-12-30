import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table"
import { Input } from "../components/ui/Input"

import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react"

import { getContracts } from "../services/contract.service"

/* ---------------- Types ---------------- */
interface Contract {
  _id: string
  contractNo: string
  tenantName: string
  propertyAddress: string
  startDate: string
  endDate: string
  status: string
}

/* ---------------- Component ---------------- */
export function Dashboard() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  /* ---------------- Fetch contracts ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getContracts()
        setContracts(data)
      } catch (err: any) {
        setError(err.message || "Failed to load contracts")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  /* ---------------- Helpers ---------------- */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>
      case "Pending":
        return <Badge variant="warning">Pending</Badge>
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filtered = contracts.filter((c) =>
    `${c.contractNo} ${c.tenantName} ${c.propertyAddress}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  /* ---------------- Render ---------------- */
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ===== Header ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your rental agreements and contracts
          </p>
        </div>

        <Link to="/create-contract">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* ===== Stats (simple demo) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Contracts
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === "Active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === "Pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contracts
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Table ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>Recent Contracts</CardTitle>

            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search contracts..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="text-sm text-slate-500">
              Loading contracts...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/contract/${c._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {c.contractNo}
                      </Link>
                    </TableCell>

                    <TableCell>{c.tenantName}</TableCell>
                    <TableCell>{c.propertyAddress}</TableCell>

                    <TableCell>
                      <div className="text-sm">{c.startDate}</div>
                      <div className="text-xs text-slate-500">
                        to {c.endDate}
                      </div>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(c.status)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
