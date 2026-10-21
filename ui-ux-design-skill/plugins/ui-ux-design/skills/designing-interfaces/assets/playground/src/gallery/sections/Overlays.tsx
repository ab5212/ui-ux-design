import { Button } from "@/components/ui/Button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { Alert, useToast } from "@/components/ui/Display";
import { Demo } from "../Section";

export function OverlaysDemo() {
  const toast = useToast();
  return (
    <>
      <Demo title="Dialog and alert dialog" note="Below 640px both open as bottom sheets. Esc closes; focus returns to the trigger.">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Rename project</Button>
            </DialogTrigger>
            <DialogContent
              title="Rename project"
              description="Names are visible to everyone in the workspace."
              footer={
                <>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={() => toast({ message: "Project renamed" })}>Rename</Button>
                  </DialogClose>
                </>
              }
            >
              <Field label="Project name">{({ id }) => <Input id={id} defaultValue="Q3 report" autoFocus />}</Field>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete project</Button>
            </DialogTrigger>
            <DialogContent
              role="alertdialog"
              title="Delete “Q3 report”?"
              description="This can’t be undone. The report and its 14 files will be removed for everyone."
              footer={
                <>
                  <DialogClose asChild>
                    <Button variant="ghost" autoFocus>Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={() => toast({ message: "Project deleted" })}>Delete project</Button>
                  </DialogClose>
                </>
              }
            >
              <p className="text-sm text-muted-foreground">Cancel has initial focus, so a stray Enter doesn’t delete anything.</p>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Long content</Button>
            </DialogTrigger>
            <DialogContent title="Terms of service" size="md" footer={<DialogClose asChild><Button>Accept</Button></DialogClose>}>
              <div className="grid gap-3 text-sm text-muted-foreground">
                {Array.from({ length: 14 }, (_, i) => (
                  <p key={i}>
                    Section {i + 1}. Header and footer stay fixed while this body scrolls, so the primary action is always reachable. The dialog never exceeds 85% of the
                    viewport height.
                  </p>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Demo>

      <Demo title="Alerts" note="Icon + text + tint. Body text stays at foreground contrast.">
        <div className="grid gap-3">
          <Alert tone="info" title="Scheduled maintenance">Billing will be read-only on Sunday from 02:00 to 03:00 UTC.</Alert>
          <Alert tone="success">Your domain is verified. Emails will now be sent from acme.com.</Alert>
          <Alert tone="warning" title="3 seats left" action={<Button size="sm" variant="outline">Add seats</Button>}>
            New invitations will fail once all seats are used.
          </Alert>
          <Alert tone="destructive" title="Payment failed">The card ending in 4242 was declined. Update your payment method to keep your plan.</Alert>
        </div>
      </Demo>
    </>
  );
}
