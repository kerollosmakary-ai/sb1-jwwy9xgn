export function canSyncContacts() {
    return Boolean(navigator.contacts?.select);
}
export async function pickContacts() {
    const contactsManager = navigator.contacts;
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
