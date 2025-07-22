"use client"

import type React from "react"
import { memo, useMemo, useState, useCallback } from "react"
import { DataGrid } from "react-data-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Upload, Plus, Trash2 } from "lucide-react"

interface SheetData {
  [key: string]: string | number
}

interface Column {
  key: string
  name: string
  editable?: boolean
  width?: number
}

interface SheetEditorProps {
  initialData?: SheetData[]
  initialColumns?: Column[]
  onDataChange?: (data: SheetData[]) => void
  readOnly?: boolean
}

const MIN_ROWS = 50
const MIN_COLS = 26

const PureSpreadsheetEditor = ({
  initialData = [],
  initialColumns = [],
  onDataChange,
  readOnly = false,
}: SheetEditorProps) => {
  const [data, setData] = useState<SheetData[]>(initialData)
  const [columns, setColumns] = useState<Column[]>(
    initialColumns.length > 0
      ? initialColumns
      : [
          { key: "A", name: "Column A", editable: true, width: 120 },
          { key: "B", name: "Column B", editable: true, width: 120 },
          { key: "C", name: "Column C", editable: true, width: 120 },
        ],
  )

  // Initialize data if empty
  useMemo(() => {
    if (data.length === 0) {
      const initialRows = Array.from({ length: 10 }, (_, index) => {
        const row: SheetData = { id: index }
        columns.forEach((col) => {
          row[col.key] = ""
        })
        return row
      })
      setData(initialRows)
    }
  }, [data.length, columns])

  const handleDataChange = useCallback(
    (newData: SheetData[]) => {
      setData(newData)
      onDataChange?.(newData)
    },
    [onDataChange],
  )

  const handleRowsChange = useCallback(
    (rows: SheetData[]) => {
      handleDataChange(rows)
    },
    [handleDataChange],
  )

  const addColumn = useCallback(() => {
    if (readOnly) return

    const newColumnKey = String.fromCharCode(65 + columns.length)
    const newColumn: Column = {
      key: newColumnKey,
      name: `Column ${newColumnKey}`,
      editable: true,
      width: 120,
    }

    setColumns((prev) => [...prev, newColumn])

    // Add empty values for the new column in existing rows
    setData((prev) =>
      prev.map((row) => ({
        ...row,
        [newColumnKey]: "",
      })),
    )
  }, [columns.length, readOnly])

  const removeColumn = useCallback(() => {
    if (readOnly || columns.length <= 1) return

    const lastColumn = columns[columns.length - 1]
    setColumns((prev) => prev.slice(0, -1))

    // Remove the column data from all rows
    setData((prev) =>
      prev.map((row) => {
        const { [lastColumn.key]: removed, ...rest } = row
        return rest
      }),
    )
  }, [columns, readOnly])

  const addRow = useCallback(() => {
    if (readOnly) return

    const newRow: SheetData = { id: data.length }
    columns.forEach((col) => {
      newRow[col.key] = ""
    })

    setData((prev) => [...prev, newRow])
  }, [data.length, columns, readOnly])

  const removeRow = useCallback(() => {
    if (readOnly || data.length <= 1) return

    setData((prev) => prev.slice(0, -1))
  }, [data.length, readOnly])

  const exportToCSV = useCallback(() => {
    const headers = columns.map((col) => col.name).join(",")
    const rows = data
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col.key]
            // Escape commas and quotes in CSV
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      )
      .join("\n")

    const csvContent = `${headers}\n${rows}`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "spreadsheet.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [columns, data])

  const importFromCSV = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return

      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length === 0) return

        // Parse headers
        const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))
        const newColumns: Column[] = headers.map((header, index) => ({
          key: String.fromCharCode(65 + index),
          name: header,
          editable: true,
          width: 120,
        }))

        // Parse data rows
        const newData: SheetData[] = lines.slice(1).map((line, rowIndex) => {
          const values = line.split(",").map((value) => value.trim().replace(/"/g, ""))
          const row: SheetData = { id: rowIndex }

          newColumns.forEach((col, colIndex) => {
            row[col.key] = values[colIndex] || ""
          })

          return row
        })

        setColumns(newColumns)
        setData(newData)
      }

      reader.readAsText(file)
    },
    [readOnly],
  )

  const gridColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        editable: !readOnly && col.editable,
        headerRenderer: () => <div className="flex items-center justify-center font-medium">{col.name}</div>,
      })),
    [columns, readOnly],
  )

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Button onClick={addRow} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Row
            </Button>
            <Button onClick={removeRow} size="sm" variant="outline">
              <Trash2 className="w-4 h-4 mr-1" />
              Remove Row
            </Button>
            <Button onClick={addColumn} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Column
            </Button>
            <Button onClick={removeColumn} size="sm" variant="outline">
              <Trash2 className="w-4 h-4 mr-1" />
              Remove Column
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={exportToCSV} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
            <label htmlFor="csv-import">
              <Button size="sm" variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-1" />
                  Import CSV
                </span>
              </Button>
            </label>
            <Input id="csv-import" type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
          </div>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 min-h-0">
        <DataGrid
          columns={gridColumns}
          rows={data}
          onRowsChange={handleRowsChange}
          className="rdg-light"
          style={{ height: "100%" }}
          defaultColumnOptions={{
            sortable: true,
            resizable: true,
          }}
          rowKeyGetter={(row) => row.id}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 text-sm text-muted-foreground border-t">
        <span>
          {data.length} rows × {columns.length} columns
        </span>
        <span>{readOnly ? "Read Only" : "Editable"}</span>
      </div>
    </div>
  )
}

function areEqual(prevProps: SheetEditorProps, nextProps: SheetEditorProps) {
  return (
    prevProps.initialData === nextProps.initialData &&
    prevProps.initialColumns === nextProps.initialColumns &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.onDataChange === nextProps.onDataChange
  )
}

export const SpreadsheetEditor = memo(PureSpreadsheetEditor, areEqual)

export default SpreadsheetEditor
