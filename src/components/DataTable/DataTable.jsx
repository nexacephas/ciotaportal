import EmptyState from "../EmptyState/EmptyState";
import "./DataTable.css";

export default function DataTable({ columns, rows, rowKey = "id", emptyTitle = "No records found", emptyDescription = "Try changing your search or filters." }) {
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="table-scroll" role="region" aria-label="Scrollable data table" tabIndex={0}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row[rowKey] ?? index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
