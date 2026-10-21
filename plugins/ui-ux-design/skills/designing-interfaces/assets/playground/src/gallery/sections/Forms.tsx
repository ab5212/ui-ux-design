import { useState } from "react";
import { Search } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, RadioGroup, Select, Textarea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { Demo } from "../Section";

export function FormsDemo() {
  const [email, setEmail] = useState("sam@");
  const [touched, setTouched] = useState(true);
  const invalid = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <>
      <Demo title="Text fields" note="Labels above, hints below, errors with icon + text, validated on blur.">
        <div className="grid max-w-xl gap-5">
          <Field label="Full name" hint="As it appears on your ID.">
            {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} autoComplete="name" defaultValue="Sam Rivera" />}
          </Field>
          <Field label="Email" error={invalid ? "Enter an email address like name@example.com" : undefined}>
            {({ id, describedBy, invalid: inv }) => (
              <Input
                id={id}
                type="email"
                autoComplete="email"
                inputMode="email"
                aria-describedby={describedBy}
                aria-invalid={inv || undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
              />
            )}
          </Field>
          <Field label="Company" optional>
            {({ id }) => <Input id={id} autoComplete="organization" />}
          </Field>
          <Field label="Search projects">
            {({ id }) => (
              <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 text-base -translate-y-1/2 text-muted-foreground" />
                <Input id={id} type="search" enterKeyHint="search" placeholder="Name or ID" className="ps-9" />
              </div>
            )}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Disabled">
              {({ id }) => <Input id={id} disabled defaultValue="Not editable" />}
            </Field>
            <Field label="Read-only">
              {({ id }) => <Input id={id} readOnly defaultValue="ACME-2041" />}
            </Field>
          </div>
          <Field label="Region">
            {({ id }) => (
              <Select id={id} defaultValue="eu">
                <option value="us">United States</option>
                <option value="eu">European Union</option>
                <option value="apac">Asia Pacific</option>
              </Select>
            )}
          </Field>
          <Field label="Notes" hint="Visible to your team only.">
            {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} rows={3} />}
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost">Cancel</Button>
            <Button type="submit">Save profile</Button>
          </div>
        </div>
      </Demo>

      <Demo title="Selection controls" note="Checkbox applies on submit; switch applies immediately; radios for 2–5 visible options.">
        <div className="grid gap-8 md:grid-cols-3">
          <fieldset className="grid content-start gap-3">
            <legend className="mb-1 text-sm font-medium">Email me about</legend>
            <Checkbox label="Product updates" defaultChecked />
            <Checkbox label="Security alerts" description="Recommended" defaultChecked />
            <Checkbox label="Newsletter" />
            <Checkbox label="Unavailable option" disabled />
          </fieldset>
          <RadioGroup
            legend="Plan"
            name="plan"
            defaultValue="team"
            options={[
              { value: "solo", label: "Solo", description: "1 seat" },
              { value: "team", label: "Team", description: "Up to 20 seats" },
              { value: "org", label: "Organization", description: "Unlimited seats" },
            ]}
          />
          <div className="grid content-start gap-4">
            <Switch label="Desktop notifications" defaultChecked />
            <Switch label="Compact mode" description="Denser rows in tables" />
            <Switch label="Beta features" disabled />
          </div>
        </div>
      </Demo>
    </>
  );
}
