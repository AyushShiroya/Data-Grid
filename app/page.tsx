import { DataGrid } from "@/components/DataGrid/DataGrid"
import { DataGridProvider } from "@/contexts/DataGridContext"

export default function Home() {
  return (
    <DataGridProvider>
      <main className="min-h-screen bg-background">
        <DataGrid />
      </main>
    </DataGridProvider>
  )
}
