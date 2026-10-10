import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { InfoTip } from './InfoTip'

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
  // Return a value to sort by; columns without it are not sortable.
  sortValue?: (row: T) => string | number
  // Plain-language explanation shown in a tooltip when the header is hovered or focused.
  description?: string
  className?: string
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  empty?: ReactNode
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, empty }: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)

  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const get = col.sortValue
    return [...rows].sort((a, b) => (get(a) > get(b) ? 1 : get(a) < get(b) ? -1 : 0) * sort!.dir)
  }, [rows, columns, sort])

  const toggle = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }))

  if (rows.length === 0 && empty) return <>{empty}</>

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((c) => {
              const label = c.sortValue ? (
                <button className="inline-flex items-center gap-1 uppercase hover:text-slate-900" onClick={() => toggle(c.key)}>
                  {c.header}
                  {sort?.key === c.key && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </button>
              ) : (
                c.header
              )
              return (
                <th key={c.key} className={`whitespace-nowrap px-3 py-3 sm:px-4 font-medium ${c.className ?? ''}`}>
                  {c.description ? (
                    <InfoTip label={c.header} text={c.description}>
                      {label}
                    </InfoTip>
                  ) : (
                    label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
            >
              {columns.map((c) => (
                <td key={c.key} className={`whitespace-nowrap px-3 py-3 sm:px-4 ${c.className ?? ''}`}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

