import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewEmployeePage() {
  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/employees">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Add New Employee
        </h1>
        <p className="text-gray-500 mt-1">
          Create a new employee record
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input type="email" placeholder="john.doe@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <Input type="tel" placeholder="+1 (555) 123-4567" />
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900">Employment Details</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input placeholder="Software Engineer" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <Input placeholder="Engineering" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Hire Date
                    </label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Salary
                    </label>
                    <Input type="number" placeholder="100000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Manager
                  </label>
                  <Input placeholder="Select manager..." disabled />
                  <p className="text-xs text-gray-500">
                    (Dropdown would go here)
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="button" disabled>
                  Create Employee
                </Button>
                <Link href="/employees">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
