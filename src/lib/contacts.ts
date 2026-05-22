export interface SyncedContact {
  name: string;
  phone: string;
  email?: string;
}

interface ContactsManager {
  select: (
    properties: Array<"name" | "tel" | "email">,
    options?: { multiple?: boolean },
  ) => Promise<Array<{ name?: string[]; tel?: string[]; email?: string[] }>>;
}

interface NavigatorWithContacts extends Navigator {
  contacts?: ContactsManager;
}

export function canSyncContacts() {
  return Boolean((navigator as NavigatorWithContacts).contacts?.select);
}

export async function pickContacts(): Promise<SyncedContact[]> {
  const contactsManager = (navigator as NavigatorWithContacts).contacts;
  if (!contactsManager?.select) {
    throw new Error("Contact Picker API is not supported in this browser");
  }

  const contacts = await contactsManager.select(["name", "tel", "email"], { multiple: true });
  return contacts
    .map((contact) => ({
      name: contact.name?.[0] || "",
      phone: contact.tel?.[0] || "",
      email: contact.email?.[0],
    }))
    .filter((contact) => contact.name || contact.phone);
}
