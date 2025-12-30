import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Download, PenTool, Printer, Share2 } from 'lucide-react';
export function ContractDetails() {
  const {
    id
  } = useParams();
  return <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link to="/dashboard">
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent mb-2">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">
              Contract #{id || 'CNT-2024-001'}
            </h1>
            <Badge variant="warning">Pending Signature</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Contract View */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="min-h-[800px] bg-white shadow-md border-slate-200">
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  Residential Lease Agreement
                </CardTitle>
                <span className="text-sm text-slate-500">Page 1 of 4</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 font-serif text-slate-800 leading-relaxed space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold uppercase underline">
                  Residential Lease Agreement
                </h2>
              </div>

              <p>
                This Lease Agreement (the "Agreement") is made and entered into
                on this <strong>1st day of January, 2024</strong>, by and
                between:
              </p>

              <div className="pl-4 border-l-4 border-slate-200">
                <p>
                  <strong>Landlord:</strong> Property Management Co.
                </p>
                <p>
                  <strong>Tenant:</strong> Alice Johnson
                </p>
              </div>

              <p>
                <strong>1. PROPERTY.</strong> Landlord leases to Tenant the
                following real property:
                <br />
                <span className="italic">
                  123 Main St, Apt 4B, New York, NY 10001
                </span>
              </p>

              <p>
                <strong>2. TERM.</strong> The term of this Lease shall begin on{' '}
                <strong>January 1, 2024</strong> and end on{' '}
                <strong>December 31, 2024</strong>.
              </p>

              <p>
                <strong>3. RENT.</strong> Tenant agrees to pay Landlord as base
                rent the sum of <strong>$1,200.00</strong> per month, due and
                payable on the 1st day of each month.
              </p>

              <p>
                <strong>4. SECURITY DEPOSIT.</strong> On execution of this
                Lease, Tenant deposits with Landlord <strong>$1,200.00</strong>{' '}
                as security for the performance of Tenant's obligations under
                this Lease.
              </p>

              <div className="mt-12 p-6 bg-yellow-50 border border-yellow-100 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-2">
                  Signature Required
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Please review the document above and sign below to execute
                  this agreement.
                </p>
                <Button className="w-full sm:w-auto">
                  <PenTool className="mr-2 h-4 w-4" />
                  Sign Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-500">
                  Created Date
                </div>
                <div className="text-slate-900">Dec 28, 2023</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">
                  Created By
                </div>
                <div className="text-slate-900">John Doe (Manager)</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">
                  Last Activity
                </div>
                <div className="text-slate-900">
                  Viewed by Tenant 2 hours ago
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signatories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                    JD
                  </div>
                  <div>
                    <div className="text-sm font-medium">John Doe</div>
                    <div className="text-xs text-slate-500">Landlord</div>
                  </div>
                </div>
                <Badge variant="success" className="text-xs">
                  Signed
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    AJ
                  </div>
                  <div>
                    <div className="text-sm font-medium">Alice Johnson</div>
                    <div className="text-xs text-slate-500">Tenant</div>
                  </div>
                </div>
                <Badge variant="warning" className="text-xs">
                  Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-slate-200 ml-2 space-y-6 pb-2">
                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300"></div>
                  <div className="text-sm text-slate-900">
                    Contract viewed by Tenant
                  </div>
                  <div className="text-xs text-slate-500">Today, 10:23 AM</div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300"></div>
                  <div className="text-sm text-slate-900">
                    Email sent to alice@example.com
                  </div>
                  <div className="text-xs text-slate-500">
                    Yesterday, 4:15 PM
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                  <div className="text-sm text-slate-900">
                    Signed by John Doe
                  </div>
                  <div className="text-xs text-slate-500">
                    Yesterday, 4:10 PM
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500"></div>
                  <div className="text-sm text-slate-900">Contract Created</div>
                  <div className="text-xs text-slate-500">
                    Yesterday, 4:00 PM
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}