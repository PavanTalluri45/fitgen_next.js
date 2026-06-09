
export function getAvatarInitials(user) {
    const fullName = user?.user_metadata?.full_name ?? "";

    if (!fullName.trim()) return "U";

    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0][0].toUpperCase();
    }

    const first = parts[0][0].toUpperCase();
    const last = parts[parts.length - 1][0].toUpperCase();
    return `${first}${last}`;
}