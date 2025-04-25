"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PaymentSummary {
  month: string
  total: number
  creditCard: number
  cash: number
  check: number
  bankTransfer: number
}

interface PaymentMethodSummary {
  method: string
  amount: number
  count: number
}

export function PaymentSummaryComponent() {
  const [activeTab, setActiveTab] = useState("monthly")
  const [monthlySummary, setMonthlySummary] = useState<PaymentSummary[]>([
    { month: "ינואר", total: 3200, creditCard: 1800, cash: 600, check: 0, bankTransfer: 800 },
    { month: "פברואר", total: 2800, creditCard: 1500, cash: 500, check: 0, bankTransfer: 800 },
    { month: "מרץ", total: 3600, creditCard: 2000, cash: 800, check: 0, bankTransfer: 800 },
    { month: "אפריל", total: 4400, creditCard: 2100, cash: 1500, check: 0, bankTransfer: 800 },
  ])

  const [methodSummary, setMethodSummary] = useState<PaymentMethodSummary[]>([
    { method: "כרטיס אשראי", amount: 7400, count: 12 },
    { method: "מזומן", amount: 3400, count: 8 },
    { method: "צ'קים", amount: 0, count: 0 },
    { method: "העברה בנקאית", amount: 3200, count: 4 },
  ])

  // In a real implementation, you would fetch this data from your API
  // useEffect(() => {
  //   const fetchData = async () => {
  //     // Fetch monthly summary data
  //     // Fetch payment method summary data
  //   }
  //   fetchData()
  // }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>סיכום תקבולים</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="monthly">לפי חודשים</TabsTrigger>
            <TabsTrigger value="method">לפי אמצעי תשלום</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlySummary}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="creditCard" name="כרטיס אשראי" fill="#8884d8" />
                  <Bar dataKey="cash" name="מזומן" fill="#82ca9d" />
                  <Bar dataKey="bankTransfer" name="העברה בנקאית" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">חודש</TableHead>
                    <TableHead className="text-right">סה"כ</TableHead>
                    <TableHead className="text-right">כרטיס אשראי</TableHead>
                    <TableHead className="text-right">מזומן</TableHead>
                    <TableHead className="text-right">צ'קים</TableHead>
                    <TableHead className="text-right">העברה בנקאית</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySummary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.month}</TableCell>
                      <TableCell>₪{item.total.toLocaleString()}</TableCell>
                      <TableCell>₪{item.creditCard.toLocaleString()}</TableCell>
                      <TableCell>₪{item.cash.toLocaleString()}</TableCell>
                      <TableCell>₪{item.check.toLocaleString()}</TableCell>
                      <TableCell>₪{item.bankTransfer.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/30">
                    <TableCell>סה"כ</TableCell>
                    <TableCell>₪{monthlySummary.reduce((sum, item) => sum + item.total, 0).toLocaleString()}</TableCell>
                    <TableCell>
                      ₪{monthlySummary.reduce((sum, item) => sum + item.creditCard, 0).toLocaleString()}
                    </TableCell>
                    <TableCell>₪{monthlySummary.reduce((sum, item) => sum + item.cash, 0).toLocaleString()}</TableCell>
                    <TableCell>₪{monthlySummary.reduce((sum, item) => sum + item.check, 0).toLocaleString()}</TableCell>
                    <TableCell>
                      ₪{monthlySummary.reduce((sum, item) => sum + item.bankTransfer, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="method">
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={methodSummary}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" name="סכום" fill="#8884d8" />
                  <Bar dataKey="count" name="מספר תשלומים" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">אמצעי תשלום</TableHead>
                    <TableHead className="text-right">מספר תשלומים</TableHead>
                    <TableHead className="text-right">סה"כ סכום</TableHead>
                    <TableHead className="text-right">סכום ממוצע</TableHead>
                    <TableHead className="text-right">אחוז מסה"כ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methodSummary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.method}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>₪{item.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        ₪{item.count > 0 ? Math.round(item.amount / item.count).toLocaleString() : 0}
                      </TableCell>
                      <TableCell>
                        {Math.round((item.amount / methodSummary.reduce((sum, i) => sum + i.amount, 0)) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/30">
                    <TableCell>סה"כ</TableCell>
                    <TableCell>{methodSummary.reduce((sum, item) => sum + item.count, 0)}</TableCell>
                    <TableCell>₪{methodSummary.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
