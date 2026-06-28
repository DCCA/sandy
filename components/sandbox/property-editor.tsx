"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { schemaToFields, type FieldDescriptor } from "@/lib/schema-introspect";
import type { Section, RegistryItem } from "@/lib/registry/types";

type PropertyEditorProps = {
  section: Section;
  registryItem: RegistryItem;
  onChange: (sectionId: string, newProps: Record<string, unknown>) => void;
};

// --- Reusable field components (follows TokenEditor styling) ---

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  actions,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        <span className="flex-1 text-left">{title}</span>
        {actions && (
          <span onClick={(e) => e.stopPropagation()} className="flex items-center gap-0.5">
            {actions}
          </span>
        )}
      </button>
      <div
        className="grid transition-all duration-200"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <label className="text-[11px] text-muted-foreground w-24 shrink-0 truncate">
      {label}
      {!required && <span className="text-muted-foreground/50 ml-0.5">(opt)</span>}
    </label>
  );
}

function StringField({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor & { kind: "string" };
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.enum) {
    return (
      <div className="flex items-center gap-2">
        <FieldLabel label={field.label} required={field.required} />
        <Select value={value || ""} onValueChange={(v) => v !== null && onChange(v)}>
          <SelectTrigger className="h-6 flex-1 min-w-0 text-[11px] font-mono">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.enum.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <FieldLabel label={field.label} required={field.required} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 flex-1 min-w-0 rounded bg-muted/30 border border-border/50 px-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
      />
    </div>
  );
}

function BooleanField({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor & { kind: "boolean" };
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <FieldLabel label={field.label} required={field.required} />
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          value ? "bg-accent" : "bg-muted/50"
        }`}
      >
        <span
          className={`block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function NumberField({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor & { kind: "number" };
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <FieldLabel label={field.label} required={field.required} />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-20 rounded bg-muted/30 border border-border/50 px-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
      />
    </div>
  );
}

// --- Recursive field renderer ---

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.kind) {
    case "string":
      return (
        <StringField
          field={field}
          value={typeof value === "string" ? value : (field.default ?? "")}
          onChange={onChange}
        />
      );
    case "boolean":
      return (
        <BooleanField
          field={field}
          value={typeof value === "boolean" ? value : (field.default ?? false)}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <NumberField
          field={field}
          value={typeof value === "number" ? value : (field.default ?? 0)}
          onChange={onChange}
        />
      );
    case "object":
      return (
        <ObjectGroup
          field={field}
          value={
            typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}
          }
          onChange={onChange}
        />
      );
    case "array":
      return (
        <ArrayField field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />
      );
  }
}

function ObjectGroup({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor & { kind: "object" };
  value: Record<string, unknown>;
  onChange: (v: unknown) => void;
}) {
  const handleFieldChange = useCallback(
    (childKey: string, childValue: unknown) => {
      onChange({ ...value, [childKey]: childValue });
    },
    [value, onChange],
  );

  return (
    <CollapsibleSection title={field.label} defaultOpen={field.required}>
      {field.fields.map((child) => (
        <FieldRenderer
          key={child.key}
          field={child}
          value={value[child.key]}
          onChange={(v) => handleFieldChange(child.key, v)}
        />
      ))}
    </CollapsibleSection>
  );
}

function ArrayField({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor & { kind: "array" };
  value: unknown[];
  onChange: (v: unknown) => void;
}) {
  const canAdd = field.maxItems === undefined || value.length < field.maxItems;
  const canRemove = field.minItems === undefined || value.length > field.minItems;

  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    // Create default item from itemFields
    const defaultItem: Record<string, unknown> = {};
    for (const f of field.itemFields) {
      if (f.kind === "string") defaultItem[f.key] = f.default ?? "";
      else if (f.kind === "boolean") defaultItem[f.key] = f.default ?? false;
      else if (f.kind === "number") defaultItem[f.key] = f.default ?? 0;
      else if (f.kind === "object") defaultItem[f.key] = {};
      else if (f.kind === "array") defaultItem[f.key] = [];
    }
    onChange([...value, defaultItem]);
  }, [canAdd, field.itemFields, value, onChange]);

  const handleRemove = useCallback(
    (idx: number) => {
      if (!canRemove) return;
      onChange(value.filter((_, i) => i !== idx));
    },
    [canRemove, value, onChange],
  );

  const handleItemChange = useCallback(
    (idx: number, childKey: string, childValue: unknown) => {
      const updated = value.map((item, i) => {
        if (i !== idx) return item;
        return { ...(item as Record<string, unknown>), [childKey]: childValue };
      });
      onChange(updated);
    },
    [value, onChange],
  );

  return (
    <CollapsibleSection
      title={`${field.label} (${value.length})`}
      defaultOpen={true}
      actions={
        canAdd ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={handleAdd}
            title="Add item"
          >
            <Plus className="size-3" />
          </Button>
        ) : undefined
      }
    >
      {value.map((item, idx) => {
        const itemObj =
          typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
        return (
          <div key={idx} className="relative border border-border/20 rounded-md p-2 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-muted-foreground/60">#{idx + 1}</span>
              {canRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
                  onClick={() => handleRemove(idx)}
                  title="Remove item"
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
            {field.itemFields.map((child) => (
              <FieldRenderer
                key={child.key}
                field={child}
                value={itemObj[child.key]}
                onChange={(v) => handleItemChange(idx, child.key, v)}
              />
            ))}
          </div>
        );
      })}
      {value.length === 0 && (
        <div className="text-[10px] text-muted-foreground/50 text-center py-2">
          No items. Click + to add one.
        </div>
      )}
    </CollapsibleSection>
  );
}

// --- Main PropertyEditor ---

export function PropertyEditor({ section, registryItem, onChange }: PropertyEditorProps) {
  const fields = useMemo(() => schemaToFields(registryItem.schema), [registryItem.schema]);

  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      const newProps = { ...section.props, [key]: value };
      onChange(section.id, newProps);
    },
    [section.id, section.props, onChange],
  );

  return (
    <div className="overflow-y-auto h-full">
      <div className="px-3 py-2 border-b border-border/30">
        <div className="text-xs font-semibold text-muted-foreground">
          {registryItem.metadata.name}
        </div>
        <div className="text-[10px] text-muted-foreground/60 font-mono">{section.id}</div>
      </div>
      {fields.map((field) => (
        <div key={field.key}>
          {field.kind === "object" || field.kind === "array" ? (
            <FieldRenderer
              field={field}
              value={section.props[field.key]}
              onChange={(v) => handleFieldChange(field.key, v)}
            />
          ) : (
            <div className="px-3 py-1.5 border-b border-border/30 last:border-0">
              <FieldRenderer
                field={field}
                value={section.props[field.key]}
                onChange={(v) => handleFieldChange(field.key, v)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
