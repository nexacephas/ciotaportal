import { Search, X } from "lucide-react";
import "./SearchBar.css";

export default function SearchBar({ value, onChange, placeholder = "Search records", label = "Search records" }) {
  return <label className="search-field"><Search size={17} aria-hidden="true" /><span className="sr-only">{label}</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /><button type="button" aria-label="Clear search" onClick={() => onChange("")} hidden={!value}><X size={15} /></button></label>;
}
